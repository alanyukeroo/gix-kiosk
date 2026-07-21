const { app, BrowserWindow, powerMonitor, globalShortcut, ipcMain } = require("electron");
const fs = require("fs");
const path = require("path");

const DEFAULTS = {
  homeUrl: "https://gix.uw.edu/b92home",
  idleSeconds: 300,
};
const POLL_MS = 1000;
const HOME_SHORTCUT = "Control+Alt+Backspace";
const SETTINGS_SHORTCUT = "Control+Alt+I";

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

function saveConfig(config) {
  fs.writeFileSync(configPath(), JSON.stringify(config, null, 2));
}

let win;
let settingsWin = null;
let atHome = true;
let config;

function openSettingsWindow() {
  if (settingsWin) {
    settingsWin.focus();
    return;
  }
  settingsWin = new BrowserWindow({
    width: 320,
    height: 160,
    resizable: false,
    alwaysOnTop: true,
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });
  settingsWin.loadFile(path.join(__dirname, "settings.html"));
  settingsWin.on("closed", () => {
    settingsWin = null;
  });
}

ipcMain.handle("get-idle-seconds", () => config.idleSeconds);

ipcMain.on("set-idle-seconds", (_event, value) => {
  config.idleSeconds = value;
  saveConfig(config);
  if (settingsWin) settingsWin.close();
});

function createWindow() {
  config = loadConfig();

  win = new BrowserWindow({
    kiosk: true,
    autoHideMenuBar: true,
    frame: false,
  });

  win.loadURL(config.homeUrl);

  win.webContents.on("did-navigate", (_event, url) => {
    atHome = url === config.homeUrl || url === `${config.homeUrl}/`;
  });

  setInterval(() => {
    if (atHome) return;
    if (powerMonitor.getSystemIdleTime() >= config.idleSeconds) {
      win.loadURL(config.homeUrl);
    }
  }, POLL_MS);

  globalShortcut.register(HOME_SHORTCUT, () => {
    win.loadURL(config.homeUrl);
  });

  globalShortcut.register(SETTINGS_SHORTCUT, openSettingsWindow);
}

app.whenReady().then(createWindow);

app.on("will-quit", () => {
  globalShortcut.unregisterAll();
});

app.on("window-all-closed", () => {
  app.quit();
});
