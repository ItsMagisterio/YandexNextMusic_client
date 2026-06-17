import { session } from "electron";

const AD_URL_PATTERNS = [
        // Yandex ad network
        "*://an.yandex.ru/*",
        "*://yabs.yandex.ru/*",
        "*://awaps.yandex.net/*",
        "*://bs.yandex.ru/*",
        "*://sonar.yandex.ru/*",
        // Yandex metrics / tracking
        "*://mc.yandex.ru/*",
        "*://mc.yandex.com/*",
        // AdFox (Yandex ad platform)
        "*://ads.adfox.ru/*",
        "*://banners.adfox.ru/*",
        "*://felix.adfox.ru/*",
        "*://adfox.ru/*",
        "*://adfox.net/*",
        // Ad exchanges used by Yandex
        "*://doubleclick.net/*",
        "*://googlesyndication.com/*",
        "*://adservice.google.com/*",
        "*://googletagmanager.com/*",
        "*://googletagservices.com/*",
        // Other ad networks
        "*://pagead2.googlesyndication.com/*",
        "*://tns-counter.ru/*",
        "*://top-fwz1.mail.ru/*",
        "*://counter.yadro.ru/*",
        "*://partner.googleadservices.com/*",
];

const AD_URL_REGEX = [
        /an\.yandex\.ru/,
        /yabs\.yandex\.ru/,
        /awaps\.yandex\.net/,
        /sonar\.yandex\.ru/,
        /bs\.yandex\.ru/,
        /mc\.yandex\.(ru|com)/,
        /adfox\.(ru|net)/,
        /doubleclick\.net/,
        /googlesyndication\.com/,
        /adservice\.google\.com/,
        /googletagmanager\.com/,
        /googletagservices\.com/,
        /tns-counter\.ru/,
        /top-fwz1\.mail\.ru/,
        /counter\.yadro\.ru/,
];

// CSS to hide any ad elements that slip through
const AD_HIDE_CSS = `
/* Hide Yandex Music ad banners */
[class*="ad-"],
[class*="-ad-"],
[class*="advert"],
[class*="banner__"],
[id*="ad-banner"],
[id*="adfox"],
[class*="adfox"],
.ad-banner,
.ads-block,
.premium-banner,
[data-analytics-label*="ad"],
iframe[src*="an.yandex.ru"],
iframe[src*="adfox"],
iframe[src*="awaps"],
div[class*="Banner__"],
div[id*="ya-ad"],
div[id*="yandex_ad"] {
    display: none !important;
    visibility: hidden !important;
    height: 0 !important;
    width: 0 !important;
    pointer-events: none !important;
}
`.trim();

let installed = false;

export function setupAdBlocker() {
        if (installed) return;
        installed = true;

        const ses = session.defaultSession;

        ses.webRequest.onBeforeRequest({ urls: AD_URL_PATTERNS }, (details, callback) => {
                const url = details.url;
                const isAd = AD_URL_REGEX.some((re) => re.test(url));

                if (isAd) {
                        console.log(`[AdBlock] Blocked: ${url}`);
                        callback({ cancel: true });
                } else {
                        callback({});
                }
        });

        console.log("[AdBlock] Ad blocker active.");
}

export { AD_HIDE_CSS };
