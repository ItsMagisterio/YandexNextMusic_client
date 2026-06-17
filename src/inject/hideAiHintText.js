(() => {
    const STYLE_ID = "nmc-hide-ai-text-style";

    function injectBaseStyles() {
        if (document.getElementById(STYLE_ID)) return;
        const style = document.createElement("style");
        style.id = STYLE_ID;
        style.textContent = `
            [class*="WordsCard_content"] { display: none !important; }
            [class*="AiBadge_root"]::after { content: none !important; display: none !important; }
            [class*="AiBadge_root"] > :not(svg):not(img) { display: none !important; }
        `;
        document.head.appendChild(style);
    }

    function forceDimmedSparkles() {
        // Force the dimmed/sparkles appearance on every AiBadge_root element
        document.querySelectorAll("[class*='AiBadge_root']").forEach((badge) => {
            const cls = badge.className;

            // Add dimmed class if not present
            if (!cls.includes("_dimmed")) {
                // Find the exact dimmed class from existing DOM or use known hash
                const dimmedClass = "AiBadge_root_dimmed__XLGvP";
                badge.classList.add(dimmedClass);
            }

            // Add centeredSparkles classes on the parent badge wrapper
            if (!cls.includes("_centeredSparkles")) {
                badge.classList.add("WordsCard_badge_centered__7GMKP");
                badge.classList.add("WordsCard_badge_centeredSparkles__sebgi");
            }

            // Force sparkles class on the SVG icon inside
            const icon = badge.querySelector("svg");
            if (icon && !icon.className.baseVal.includes("_sparkles")) {
                icon.classList.add("AiBadge_icon_sparkles__cS_kL");
            }
        });
    }

    injectBaseStyles();
    forceDimmedSparkles();

    new MutationObserver(forceDimmedSparkles).observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ["class"],
    });
})();
