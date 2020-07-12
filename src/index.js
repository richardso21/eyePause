const { app, BrowserWindow, Tray, Menu, ipcMain, dialog } = require("electron");
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
  // create tray w/ icon
  mainTray = new Tray(path.join(__dirname, "assets/eyes.png"));
  const menu = Menu.buildFromTemplate([
    {
      label: "Show",
      click() {
        mainWindow.show();
      },
    },
    {
      label: "Hide",
      click() {
        mainWindow.hide();
      },
    },
    {
      type: "separator",
    },
    {
      label: "Halt Breaking",
      type: "checkbox",
      checked: false,
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

// >>> timer-related functions thru ipc
let IntTimer = new Timer();
ipcMain.on("startIntTimer", (e, minutes) => {
  IntTimer.start({ countdown: true, startValues: { minutes: minutes } });
});

ipcMain.on("pauseIntTimer", () => {
  IntTimer.pause();
});

ipcMain.on("resumeIntTimer", () => {
  if (IntTimer.isPaused) {
    IntTimer.start();
  }
});

ipcMain.on("stopIntTimer", () => {
  IntTimer.stop();
});

ipcMain.on("getIntTimeRemaining", (event, arg) => {
  event.returnValue = IntTimer.getTimeValues();
});

IntTimer.on("targetAchieved", () => {
  // ipcMain.
});
// <<< timer-related functions thru ipc

// confirm for exit
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
// ipc main listener
ipcMain.on("exitConfirm", exitConfirm);

// receive exit signal and quit
ipcMain.on("exitSig", () => {
  app.quit();
});

// boilerplate
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
