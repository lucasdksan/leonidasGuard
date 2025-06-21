const { app, BrowserWindow, nativeImage } = require("electron");
const path = require("node:path");

function createWindow() {
    const icon = nativeImage.createFromPath(`${app.getAppPath()}/public/assets/icon.png`);
    const win = new BrowserWindow({
        icon,
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, "preload.js")
        }
    });
};

app.on("ready", function () {
    createWindow();

    app.on("activate", function () {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit()
    }
});