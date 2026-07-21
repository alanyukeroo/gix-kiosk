const { app, BrowserWindow, powerMonitor } = require("electron");

const HOME_URL = "https://gix.uw.edu";
const IDLE_SECONDS = 20;
const POLL_MS = 1000;

let win;
let atHome = true;

function createWindow() {
  win = new BrowserWindow({
    kiosk: true,
    autoHideMenuBar: true,
    frame: false,
  });

  win.loadURL(HOME_URL);

  win.webContents.on("did-navigate", (_event, url) => {
    atHome = url === HOME_URL || url === `${HOME_URL}/`;
  });

  setInterval(() => {
    if (atHome) return;
    if (powerMonitor.getSystemIdleTime() >= IDLE_SECONDS) {
      win.loadURL(HOME_URL);
    }
  }, POLL_MS);
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  app.quit();
});
