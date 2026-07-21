# gix-kiosk

Electron kiosk app for gix.uw.edu. Loads the real site fullscreen with no
window chrome, and returns to the homepage after 20 seconds of true
system-level inactivity (mouse, keyboard, scroll, anywhere on screen).

Uses Electron's `powerMonitor.getSystemIdleTime()` instead of DOM events
because the site is loaded directly (not in an iframe), and there's no way
for JS to see clicks/scrolls happening in a normal cross-origin page anyway.
System idle time works regardless of what's focused.

## Setup

```bash
npm install
```

## Run

```bash
npm start
```

Press `Cmd+Q` to quit.

## Config

Edit `HOME_URL` and `IDLE_SECONDS` at the top of `main.js`.
