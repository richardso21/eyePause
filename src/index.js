const { app, BrowserWindow, Tray, Menu, ipcMain, dialog } = require("electron");
const path = require("path");
const robot = require("robotjs");

const icon = path.join(__dirname, "assets/eyes.ico");

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
    icon: icon,
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
  mainTray = new Tray(icon);
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

  // check mouse activity at all times
  checkInactivity();
};

function checkInactivity() {
  let c = 0;
  let toggle = false;
  let mousePos = robot.getMousePos();
  let mousePosNext;
  // in every five seconds...
  setInterval(() => {
    // get the current mouse position
    mousePosNext = robot.getMousePos();
    // if mouse stayed at same position 5 seconds ago, increment counter
    if (mousePos.x === mousePosNext.x && mousePos.y === mousePosNext.y) c++;
    // resume timer if counter was already on threshold
    else if (c >= 5) {
      mainWindow.webContents.send("userIdledToggle");
      c = 0;
      toggle = false;
    }
    // reset counter
    else {
      c = 0;
      toggle = false;
    }
    // if not toggled yet and counter is at threshold
    if (c >= 5 && toggle === false) {
      // send ipc signal to stop timer
      mainWindow.webContents.send("userIdledToggle");
      toggle = true;
    }
    // reassign (copy) most recent mouse position to placeholder
    Object.assign(mousePos, mousePosNext);
  }, 5000);
}

// execute once electron is ready
app.on("ready", main);

// once interval timer is done, bring up overlay
ipcMain.on("IntTimerDone", () => {
  overlayWindow = new BrowserWindow({
    icon: icon,
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

  // execute interval timer again once break timer is done
  overlayWindow.on("close", () => {
    mainWindow.webContents.send("IntTimerStart");
  });
});

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
