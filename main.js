const { app, BrowserWindow, powerMonitor, globalShortcut } = require("electron");
const fs = require("fs");
const path = require("path");

const DEFAULTS = {
  homeUrl: "https://gix.uw.edu/b92home",
  idleSeconds: 300,
};
const POLL_MS = 1000;
const HOME_SHORTCUT = "Control+Alt+Backspace";

function configPath() {
  const dir = app.isPackaged ? path.dirname(process.execPath) : __dirname;
  return path.join(dir, "config.json");
}

function loadConfig() {
  const file = configPath();
  try {
    const parsed = JSON.parse(fs.readFileSync(file, "utf-8"));
    return {
      homeUrl: typeof parsed.homeUrl === "string" ? parsed.homeUrl : DEFAULTS.homeUrl,
      idleSeconds: Number.isFinite(parsed.idleSeconds) ? parsed.idleSeconds : DEFAULTS.idleSeconds,
    };
  } catch {
    fs.writeFileSync(file, JSON.stringify(DEFAULTS, null, 2));
    return { ...DEFAULTS };
  }
}

let win;
let atHome = true;

function createWindow() {
  const { homeUrl, idleSeconds } = loadConfig();

  win = new BrowserWindow({
    kiosk: true,
    autoHideMenuBar: true,
    frame: false,
  });

  win.loadURL(homeUrl);

  win.webContents.on("did-navigate", (_event, url) => {
    atHome = url === homeUrl || url === `${homeUrl}/`;
  });

  setInterval(() => {
    if (atHome) return;
    if (powerMonitor.getSystemIdleTime() >= idleSeconds) {
      win.loadURL(homeUrl);
    }
  }, POLL_MS);

  globalShortcut.register(HOME_SHORTCUT, () => {
    win.loadURL(homeUrl);
  });
}

app.whenReady().then(createWindow);

app.on("will-quit", () => {
  globalShortcut.unregisterAll();
});

app.on("window-all-closed", () => {
  app.quit();
});
