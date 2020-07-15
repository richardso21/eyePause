const { remote, ipcRenderer } = require("electron");
const Store = require("electron-store");
const store = new Store({ defaults: { BreakInt: 30, BreakDur: 5 } });

// load onto input fields
const inputBreakInt = document.getElementById("inputBreakInt");
const inputBreakDur = document.getElementById("inputBreakDur");

inputBreakInt.setAttribute("value", store.get("BreakInt").toString());
inputBreakDur.setAttribute("value", store.get("BreakDur").toString());

// event listeners for button toggle
const toggler = document.getElementById("toggler");
const subtitle = document.querySelector(".subtitle");
function toggleFunc() {
  if (toggler.checked == true) {
    document.body.style.backgroundColor = "#bcf5d1";
    subtitle.innerHTML = "Bring justice back to your eyes!";
  } else {
    document.body.style.backgroundColor = "#f5bcbc";
    subtitle.innerHTML = "eyePause is NOT enabled!";
  }
  // toggle state of timer
  ipcRenderer.send("toggleIntTimer");
}
toggler.addEventListener("click", toggleFunc);

// save options thru `electron-store` once pressed on button
const saveButton = document.getElementById("saveButton");
saveButton.addEventListener("click", () => {
  store.set("BreakInt", parseInt(inputBreakInt.getAttribute("value")));
  store.set("BreakDur", parseInt(inputBreakDur.getAttribute("value")));

  ipcRenderer.send("resetIntTimer");
});

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
