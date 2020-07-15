const {
  app,
  BrowserWindow,
  Tray,
  Menu,
  ipcMain,
  dialog,
  Notification,
} = require("electron");
const path = require("path");
const { Timer } = require("easytimer.js");
const Store = require("electron-store");
const store = new Store({ defaults: { BreakInt: 30, BreakDur: 5 } });

// boilerplate
if (require("electron-squirrel-startup")) {
  app.quit();
}

let mainWindow = null;
let mainTray = null;
let overlayWindow = null;

// creating main window & tray
const main = () => {
  // create menu
  mainWindow = new BrowserWindow({
    width: 650,
    height: 500,
    frame: false,
    resizable: false,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
    },
  });
  // load html + css on main window
  mainWindow.loadFile(path.join(__dirname, "index.html"));
  mainWindow.isVisible();
  // create tray w/ icon
  mainTray = new Tray(path.join(__dirname, "assets/eyes.png"));
  const menu = Menu.buildFromTemplate([
    {
      label: "Show/Hide",
      click() {
        if (mainWindow.isVisible()) {
          mainWindow.hide();
        } else {
          mainWindow.show();
        }
      },
    },
    {
      type: "separator",
    },
    {
      label: "Quit",
      click() {
        exitConfirm();
      },
    },
  ]);
  // set menu for tray
  mainTray.setToolTip("eyePause");
  mainTray.setContextMenu(menu);
  // event listener for tray
  mainTray.on("click", () => {
    mainWindow.show();
  });
};
// execute once electron is ready
app.on("ready", main);

// >>> timer-related functions
let IntTimer = new Timer({ countdown: true });
let BkTimer = new Timer({ countdown: true });

function startTimer(timer, minutes) {
  timer.start({ startValues: { minutes: minutes } });
}

startTimer(IntTimer, store.get("BreakInt"));

ipcMain.on("toggleIntTimer", () => {
  if (IntTimer.isPaused()) {
    IntTimer.start();
  } else {
    IntTimer.pause();
  }
});

ipcMain.on("resetIntTimer", () => {
  IntTimer.stop();
  startTimer(IntTimer, store.get("BreakInt"));
});

IntTimer.on("secondsUpdated", () => {
  const minutesLeft = IntTimer.getTimeValues().minutes;
  if ([10, 5, 1].includes(minutesLeft)) {
    const notif = new Notification({
      title: "eyePause",
      body: `You have ${minutesLeft} minute(s) left before your break!`,
    });
    notif.show();
  }
});

IntTimer.on("targetAchieved", () => {
  // TODO Move timers into other js modules, I can't handle this anymore!!! 

  IntTimer.stop();

  startTimer(BkTimer, store.get("BreakDur"));
  overlayWindow = new BrowserWindow({
    transparent: true,
    fullscreen: true,
    kiosk: true,
    frame: false,
    movable: false,
    resizable: false,
    webPreferences: {
      nodeIntegration: true,
    },
  });
  overlayWindow.setAlwaysOnTop(true, "screen-saver");
  overlayWindow.loadFile(path.join(__dirname, "assets/break.html"));

  BkTimer.on("targetAchieved", () => {
    overlayWindow.close();
  });

  overlayWindow.on("close", () => {
    startTimer(IntTimer, store.get("BreakInt"));
  });
});
// <<< timer-related functions

// exit confirmation from ipc or `index.js`
function exitConfirm() {
  const options = {
    type: "question",
    title: "Quit eyePause?",
    message: "Are you sure you want to quit eyePause?",
    buttons: ["Yes", "No"],
  };
  dialog.showMessageBox(null, options).then((data) => {
    if (data.response == 0) {
      app.quit();
    }
  });
}
ipcMain.on("exitConfirm", exitConfirm);

// boilerplate
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    main();
  }
});
