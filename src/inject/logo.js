(() => {
        const STYLE_ID = "nmc-logo-style";
        const LOGO_IMG_ID = "nmc-custom-logo-img";
        const LOGO_WRAP_ID = "nmc-custom-logo-wrap";

        const IMG_H  = 78;
        const FULL_W = 200;
        const STAR_W = 59; // Math.round(237 * 78 / 316) — star portion only

        function getLogoSrc() {
                const base = (window.__NMC_ASSETS_DIR__ || "").replace(/\/$/, "");
                return base + "/logo-custom.png";
        }

        function injectStyles() {
                if (document.getElementById(STYLE_ID)) return;
                const style = document.createElement("style");
                style.id = STYLE_ID;
                style.textContent =
                        "#" + LOGO_WRAP_ID + "{" +
                                "display:flex;align-items:center;overflow:hidden;" +
                                "flex-shrink:0;pointer-events:none;" +
                                "width:" + FULL_W + "px;height:" + IMG_H + "px;" +
                                "transition:width 0.25s ease;" +
                        "}" +
                        "#" + LOGO_IMG_ID + "{" +
                                "display:block;height:" + IMG_H + "px;width:auto;" +
                                "flex-shrink:0;pointer-events:none;" +
                        "}" +
                        ".nmc-logo-collapsed #" + LOGO_WRAP_ID + "{" +
                                "width:" + STAR_W + "px;" +
                        "}";
                document.head.appendChild(style);
        }

        function findLogoLink() {
                const sels = [
                        "[class*='NavbarDesktop_logoLink']",
                        "[class*='NavbarDesktop_logo'] > a",
                        "[class*='NavbarDesktop_logo'] a",
                        "[class*='Logo_link']",
                ];
                for (const sel of sels) {
                        const el = document.querySelector(sel);
                        if (el) return el;
                }
                return null;
        }

        function hideOriginalContent(logoLink) {
                for (const child of logoLink.children) {
                        if (child.id === LOGO_WRAP_ID) continue;
                        child.style.setProperty("opacity", "0", "important");
                        child.style.setProperty("position", "absolute", "important");
                        child.style.setProperty("pointer-events", "none", "important");
                }
        }

        // liteVersionMode.js saves its state here in localStorage (same tab — no
        // "storage" event fires, so we patch setItem to catch same-tab writes).
        const LITE_KEY = "__ym_lite_mode";

        function isCollapsed() {
                // Primary: measure the actual rendered nav link width.
                // Expanded mode: icon + text label → ~150-200 px wide.
                // Collapsed (lite) mode: icon only → ~40-60 px wide.
                const link = document.querySelector(
                        "[class*='NavbarDesktop_navigation'] li a"
                );
                if (link) {
                        const w = link.getBoundingClientRect().width;
                        if (w > 0) return w < 80; // DOM is rendered — trust the measurement
                }
                // Fallback: localStorage when sidebar hasn't rendered yet
                try {
                        return localStorage.getItem(LITE_KEY) === "ENABLED";
                } catch (_) {}
                return false;
        }

        function applyCollapse(logoContainer) {
                logoContainer.classList.toggle("nmc-logo-collapsed", isCollapsed());
        }

        function patchLocalStorage(onChange) {
                if (localStorage._nmcPatched) return;
                localStorage._nmcPatched = true;
                const orig = localStorage.setItem.bind(localStorage);
                localStorage.setItem = function (key, value) {
                        orig(key, value);
                        if (key === LITE_KEY) onChange();
                };
        }

        function setupCollapseWatch(refEl) {
                if (refEl._nmcLogoSetup) return;
                refEl._nmcLogoSetup = true;

                let timer = null;
                function update() {
                        applyCollapse(refEl);
                }
                // Call immediately + once more after layout settles (avoids mid-render reads)
                function scheduleUpdate() {
                        update();
                        clearTimeout(timer);
                        timer = setTimeout(update, 200);
                }

                // Catch same-tab lite mode toggles (liteVersionMode.js → localStorage)
                patchLocalStorage(scheduleUpdate);

                // Catch cross-tab changes
                window.addEventListener("storage", (e) => {
                        if (e.key === LITE_KEY) scheduleUpdate();
                });

                // Watch nav link width (sidebar resize / toggle animation)
                const link = document.querySelector(
                        "[class*='NavbarDesktop_navigation'] li a"
                );
                if (link) new ResizeObserver(scheduleUpdate).observe(link);

                // Watch nav container for class/attribute changes (SPA navigation)
                const nav = document.querySelector("[class*='NavbarDesktop_navigation']");
                if (nav) {
                        new MutationObserver(scheduleUpdate).observe(nav, {
                                attributes: true,
                                subtree: true,
                                attributeFilter: ["class", "style"],
                        });
                }

                scheduleUpdate();
        }

        function inject() {
                if (document.getElementById(LOGO_IMG_ID)) return;

                const logoLink = findLogoLink();
                if (!logoLink) return;

                injectStyles();

                const wrap = document.createElement("div");
                wrap.id = LOGO_WRAP_ID;

                const img = document.createElement("img");
                img.id = LOGO_IMG_ID;
                img.src = getLogoSrc();
                img.alt = "Музыка";
                img.draggable = false;

                wrap.appendChild(img);
                logoLink.appendChild(wrap);
                hideOriginalContent(logoLink);

                const childObs = new MutationObserver(() => hideOriginalContent(logoLink));
                childObs.observe(logoLink, { childList: true });

                setupCollapseWatch(logoLink);
        }

        inject();

        const obs = new MutationObserver(() => {
                if (!document.getElementById(LOGO_IMG_ID)) inject();
        });
        obs.observe(document.body, { childList: true, subtree: true });
})();
