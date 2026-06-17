(() => {
        const STYLE_ID = "nmc-hide-nav-items-style";

        // Keywords matched against nav item text and page section headings
        const HIDDEN_TEXTS = ["Книги", "подкаст", "Подкаст", "аудиокниг", "Аудиокниг"];

        // href fragments used to hide nav items via CSS and page links
        const HIDDEN_HREFS = ["books", "podcast", "audiobook"];

        // ── CSS: hide nav <li> by href ────────────────────────────────────────────
        function injectStyles() {
                if (document.getElementById(STYLE_ID)) return;
                const navRules = HIDDEN_HREFS.map(
                        (kw) =>
                                "[class*='NavbarDesktop_navigation'] li:has(a[href*='" + kw + "'])"
                ).join(",");
                const style = document.createElement("style");
                style.id = STYLE_ID;
                style.textContent = navRules + "{ display:none !important; }";
                document.head.appendChild(style);
        }

        // ── JS: hide nav <li> by text ─────────────────────────────────────────────
        function hideNavByText() {
                const nav = document.querySelector("[class*='NavbarDesktop_navigation']");
                if (!nav) return;
                nav.querySelectorAll("li").forEach((li) => {
                        if (li.dataset.nmcNavHidden) return;
                        if (HIDDEN_TEXTS.some((t) => li.textContent.includes(t))) {
                                li.style.setProperty("display", "none", "important");
                                li.dataset.nmcNavHidden = "1";
                        }
                });
        }

        // ── JS: hide page sections/shelves containing keyword headings ────────────
        // Scroll/page root selectors — we stop before these
        const ROOT_RE = /PageContent|pageContent|ScrollContent|scrollContent|Main_main|Content_content|Layout_layout/i;

        function findShelfRoot(el) {
                // Walk up and collect ALL shelf-like ancestors, then return the highest
                // one before the page root — that eliminates both content and its padding.
                let best = null;
                let node = el.parentElement;
                while (node && node !== document.body) {
                        const cls = node.className || "";
                        if (ROOT_RE.test(cls)) break; // stop at page container
                        if (
                                /Shelf|shelf|Section|section|Block|block|Widget|widget|Row|row|Item|item/i.test(cls) &&
                                node.getBoundingClientRect().height > 40
                        ) {
                                best = node; // keep going — take the outermost match
                        }
                        node = node.parentElement;
                }
                if (best) return best;
                // Fallback: four levels up
                let fallback = el;
                for (let i = 0; i < 4 && fallback.parentElement; i++) {
                        fallback = fallback.parentElement;
                }
                return fallback;
        }

        function hidePageSections() {
                // Candidates: headings, links, and titled spans outside the sidebar
                const candidates = document.querySelectorAll(
                        "h1, h2, h3, h4, [class*='Title'], [class*='title'], [class*='Heading'], [class*='heading']"
                );
                candidates.forEach((el) => {
                        if (el.dataset.nmcSectionChecked) return;
                        el.dataset.nmcSectionChecked = "1";

                        // Skip anything inside the sidebar nav
                        if (el.closest("[class*='NavbarDesktop']")) return;

                        if (HIDDEN_TEXTS.some((t) => el.textContent.includes(t))) {
                                const shelf = findShelfRoot(el);
                                shelf.style.setProperty("display", "none", "important");
                                shelf.dataset.nmcSectionHidden = "1";
                        }
                });

                // Also hide by href: any link outside the nav pointing to books/podcasts
                document.querySelectorAll("a[href]").forEach((a) => {
                        if (a.dataset.nmcSectionChecked) return;
                        a.dataset.nmcSectionChecked = "1";
                        if (a.closest("[class*='NavbarDesktop']")) return;
                        if (HIDDEN_HREFS.some((kw) => a.href.includes(kw))) {
                                const shelf = findShelfRoot(a);
                                if (shelf !== document.body) {
                                        shelf.style.setProperty("display", "none", "important");
                                        shelf.dataset.nmcSectionHidden = "1";
                                }
                        }
                });
        }

        // ── Init ──────────────────────────────────────────────────────────────────
        function run() {
                injectStyles();
                hideNavByText();
                hidePageSections();
        }

        run();

        new MutationObserver(() => {
                hideNavByText();
                hidePageSections();
        }).observe(document.body, { childList: true, subtree: true });
})();
