const { remote, ipcRenderer } = require("electron");
const path = require("path");
const Store = require("electron-store");
const store = new Store({ defaults: { BreakInt: 30, BreakDur: 5 } });

// event listeners for button toggle
const toggler = document.getElementById("toggler");
const sbtitle = document.querySelector(".subtitle");
function toggleFunc() {
  if (toggler.checked == true) {
    document.body.style.backgroundColor = "#bcf5d1";
    sbtitle.innerHTML = "Bring justice back to your eyes!";

    ipcRenderer.send("resumeIntTimer");
  } else {
    document.body.style.backgroundColor = "#f5bcbc";
    sbtitle.innerHTML = "eyePause is NOT enabled!";

    const timeRemaining = ipcRenderer.sendSync("getIntTimeRemaining");
    if (timeRemaining.minutes < 2) {
      ipcRenderer.send("stopIntTimer");
    } else {
      ipcRenderer.send("pauseIntTimer");
    }
  }
}

// exit once pressed on button
const exitButton = document.getElementById("exitButton");
exitButton.addEventListener("click", () => {
  ipcRenderer.send("exitConfirm");
});

// hide window to tray
const closeButton = document.getElementById("closeButton");
closeButton.addEventListener("click", () => {
  const win = remote.getCurrentWindow();
  win.hide();
});
