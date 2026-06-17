(() => {
        const BTN_ID = "nmc-settings-btn";
        const WAVE_HIDE_ID = "nmc-wave-hide-style";
        const STYLE_ID = "nmc-settings-btn-style";

        const GEAR_PATH =
                "M19.14 12.94c.04-.3.06-.61.06-.94s-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z";

        function hideWaveNotification() {
                if (document.getElementById(WAVE_HIDE_ID)) return;
                const style = document.createElement("style");
                style.id = WAVE_HIDE_ID;
                style.textContent = `
                        [class*="WaveUpdate"],
                        [class*="waveUpdate"],
                        [class*="wave-update"],
                        [class*="MyWaveUpdate"],
                        [class*="myWaveUpdate"],
                        [class*="HeaderWave"],
                        [class*="headerWave"],
                        [class*="NavbarDesktop_waveUpdate"],
                        [class*="NavbarDesktop_myWave"] {
                                display: none !important;
                        }
                `;
                document.head.appendChild(style);

                const waveObserver = new MutationObserver(() => {
                        document.querySelectorAll("*").forEach((el) => {
                                if (el.dataset.nmcWaveChecked || el.children.length > 3) return;
                                const text = el.textContent.trim();
                                if (text === "Моя волна обновилась") {
                                        el.dataset.nmcWaveChecked = "1";
                                        const hide = el.closest("button, a, div[class]") || el;
                                        hide.style.setProperty("display", "none", "important");
                                }
                        });
                });
                waveObserver.observe(document.body, { childList: true, subtree: true });
        }

        function injectStyles() {
                if (document.getElementById(STYLE_ID)) return;
                const style = document.createElement("style");
                style.id = STYLE_ID;
                style.textContent = `
                        #${BTN_ID} [data-nmc-label] {
                                display: block;
                        }
                        .nmc-nav-collapsed #${BTN_ID} [data-nmc-label] {
                                display: none !important;
                        }
                `;
                document.head.appendChild(style);
        }

        function findCollectionItem() {
                const candidates = document.querySelectorAll(
                        '[class*="NavbarDesktop_navigation"] ol li',
                );
                for (const li of candidates) {
                        const a = li.querySelector("a");
                        const href = a?.getAttribute("href") || "";
                        const text = li.textContent?.trim() || "";
                        if (href.includes("/collection") || text.includes("Коллекция")) {
                                return li;
                        }
                }
                return null;
        }

        function patchSvg(clonedLi) {
                const svgs = clonedLi.querySelectorAll("svg");
                for (const svg of svgs) {
                        svg.innerHTML = "";
                        svg.setAttribute("viewBox", "0 0 24 24");
                        svg.setAttribute("fill", "currentColor");
                        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
                        path.setAttribute("d", GEAR_PATH);
                        svg.appendChild(path);
                        return true;
                }
                return false;
        }

        function patchLabel(clonedLi) {
                const a = clonedLi.querySelector("a");
                if (!a) return;
                const walker = document.createTreeWalker(a, NodeFilter.SHOW_TEXT);
                let node;
                while ((node = walker.nextNode())) {
                        const trimmed = node.textContent.trim();
                        if (trimmed && trimmed.length > 1 && node.parentElement && !node.parentElement.closest("svg")) {
                                node.textContent = "Настройки";
                                node.parentElement.setAttribute("data-nmc-label", "1");
                                return;
                        }
                }
                const els = a.querySelectorAll("div, span");
                for (const el of els) {
                        if (!el.closest("svg") && el.children.length === 0 && el.textContent.trim()) {
                                el.textContent = "Настройки";
                                el.setAttribute("data-nmc-label", "1");
                                return;
                        }
                }
        }

        function cloneNativeItem(sourceItem) {
                const clone = sourceItem.cloneNode(true);

                clone.querySelectorAll("[class]").forEach((el) => {
                        const cls = el.className;
                        if (typeof cls === "string") {
                                el.className = cls
                                        .split(" ")
                                        .filter((c) => !/active|Active|current|Current|selected|Selected/.test(c))
                                        .join(" ");
                        }
                });
                clone.querySelectorAll("[aria-current]").forEach((el) =>
                        el.removeAttribute("aria-current"),
                );

                patchSvg(clone);
                patchLabel(clone);

                const a = clone.querySelector("a");
                if (a) {
                        a.id = BTN_ID;
                        a.removeAttribute("href");
                        a.style.cursor = "pointer";
                        a.addEventListener("click", (e) => {
                                e.preventDefault();
                                if (window.nmcApp && typeof window.nmcApp.openSettings === "function") {
                                        window.nmcApp.openSettings();
                                }
                        });
                }

                return clone;
        }

        function setupCollapseDetection() {
                const nav = document.querySelector('[class*="NavbarDesktop_navigation"]');
                if (!nav || nav._nmcResizeObserver) return;

                const update = () => {
                        const w = nav.getBoundingClientRect().width;
                        const collapsed = w > 0 && w < 120;
                        nav.classList.toggle("nmc-nav-collapsed", collapsed);
                };

                const ro = new ResizeObserver(update);
                ro.observe(nav);
                nav._nmcResizeObserver = ro;
                update();
        }

        function inject() {
                if (document.getElementById(BTN_ID)) return;

                const collectionItem = findCollectionItem();
                if (!collectionItem) return;

                injectStyles();

                let injected;
                try {
                        injected = cloneNativeItem(collectionItem);
                } catch {
                        return;
                }

                collectionItem.after(injected);
                setupCollapseDetection();
        }

        hideWaveNotification();
        inject();

        const observer = new MutationObserver(() => {
                if (!document.getElementById(BTN_ID)) {
                        inject();
                } else {
                        setupCollapseDetection();
                }
        });

        observer.observe(document.body, { childList: true, subtree: true });
})();
