(() => {
        const BTN_ID = "nmc-settings-btn";

        const CSS = `
                #${BTN_ID} {
                        display: flex;
                        align-items: center;
                        gap: 10px;
                        width: 100%;
                        padding: 8px 12px;
                        margin: 2px 0;
                        background: transparent;
                        border: none;
                        border-radius: 8px;
                        cursor: pointer;
                        color: var(--ym-color-text-secondary, #aaa);
                        font-size: 13px;
                        font-family: inherit;
                        text-align: left;
                        box-sizing: border-box;
                        transition: background 0.15s ease, color 0.15s ease;
                        text-decoration: none;
                        outline: none;
                }
                #${BTN_ID}:hover {
                        background: var(--ym-background-color-primary-hover, rgba(255,255,255,0.08));
                        color: var(--ym-color-text-primary, #fff);
                }
                #${BTN_ID}:active {
                        background: var(--ym-background-color-primary-active, rgba(255,255,255,0.12));
                }
                #${BTN_ID} .nmc-settings-icon {
                        flex-shrink: 0;
                        width: 20px;
                        height: 20px;
                        opacity: 0.75;
                }
                #${BTN_ID}:hover .nmc-settings-icon {
                        opacity: 1;
                }
                #${BTN_ID} .nmc-settings-label {
                        white-space: nowrap;
                        overflow: hidden;
                        text-overflow: ellipsis;
                }
                .nmc-settings-divider {
                        height: 1px;
                        margin: 4px 12px;
                        background: var(--ym-background-color-secondary-enabled-basic, rgba(255,255,255,0.08));
                }
        `;

        const GEAR_SVG = `<svg class="nmc-settings-icon" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M19.14 12.94c.04-.3.06-.61.06-.94s-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/>
        </svg>`;

        function getLabelText() {
                return "Настройки";
        }

        function injectStyles() {
                if (document.getElementById("nmc-settings-btn-style")) return;
                const style = document.createElement("style");
                style.id = "nmc-settings-btn-style";
                style.textContent = CSS;
                document.head.appendChild(style);
        }

        function findNavContainer() {
                const selectors = [
                        '[class*="NavbarDesktop_navigation"]',
                        '[class*="Sidebar_sidebar"]',
                        '[class*="sidebar"]',
                        'nav[class*="navigation"]',
                ];
                for (const sel of selectors) {
                        const el = document.querySelector(sel);
                        if (el) return el;
                }
                return null;
        }

        function createButton() {
                const btn = document.createElement("button");
                btn.id = BTN_ID;
                btn.innerHTML = `${GEAR_SVG}<span class="nmc-settings-label">${getLabelText()}</span>`;
                btn.addEventListener("click", () => {
                        if (window.nmcApp && typeof window.nmcApp.openSettings === "function") {
                                window.nmcApp.openSettings();
                        }
                });
                return btn;
        }

        function inject() {
                if (document.getElementById(BTN_ID)) return;

                const nav = findNavContainer();
                if (!nav) return;

                injectStyles();

                const divider = document.createElement("div");
                divider.className = "nmc-settings-divider";

                const btn = createButton();

                nav.appendChild(divider);
                nav.appendChild(btn);
        }

        inject();

        const observer = new MutationObserver(() => {
                if (!document.getElementById(BTN_ID)) {
                        inject();
                }
        });

        observer.observe(document.body, { childList: true, subtree: true });
})();
