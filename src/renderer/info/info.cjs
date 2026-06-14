const { shell } = require("electron");

// Version is taken automatically from package.json
const { version: currentPkgVersion } = require("../../../package.json");

const CURRENT_VERSION = currentPkgVersion.startsWith("v")
        ? currentPkgVersion
        : `v${currentPkgVersion}`;

document.querySelector(".version").textContent = CURRENT_VERSION;
const title = `Yandex Next ${CURRENT_VERSION} By magister1o`;
document.querySelector(".nm_title").textContent = title;

// Buttons
const buttonActions = {
        women: () => {
                shell.openExternal("https://github.com/ItsMagisterio");
        },
        discordBtn: () => shell.openExternal("https://github.com/ItsMagisterio"),
        githubBtn: () => shell.openExternal("https://github.com/ItsMagisterio"),
        boostyBtn: () => shell.openExternal("https://github.com/ItsMagisterio"),
        youtubeBtn: () => shell.openExternal("https://github.com/ItsMagisterio"),
};

Object.entries(buttonActions).forEach(([id, action]) => {
        document.getElementById(id).addEventListener("click", action);
});
