const { remote, ipcRenderer } = require("electron");
const { Notification } = remote;
const { Timer } = require("easytimer.js");
const IntTimer = new Timer({ countdown: true });
const path = require("path");
const Store = require("electron-store");
const store = new Store({ defaults: { BreakInt: 30, BreakDur: 5 } });

// constant variables of document elements
const timer = document.getElementById("timer");
const inputBreakInt = document.getElementById("inputBreakInt");
const inputBreakDur = document.getElementById("inputBreakDur");
const toggler = document.getElementById("toggler");
const subtitle = document.querySelector(".subtitle");
const saveButton = document.getElementById("saveButton");
const exitButton = document.getElementById("exitButton");
const closeButton = document.getElementById("closeButton");

// >>> Timer-related functions & event listeners for interval timer
// start timer function
function startTimer() {
  IntTimer.start({ startValues: { minutes: store.get("BreakInt") } });
  document.body.style.backgroundColor = "#8de0ab";
  subtitle.innerHTML = "Bring justice back to your eyes!";
  toggler.checked = true;
}

// initialize timer
startTimer();

// event listener to start timer (after break itmer)
ipcRenderer.on("IntTimerStart", () => {
  startTimer();
});

// update timer element on html
IntTimer.on("secondsUpdated", () => {
  timer.innerHTML = IntTimer.getTimeValues().toString();
});

// check timer per minute and give notification on 10, 5, 1 minute mark
IntTimer.on("minutesUpdated", () => {
  const minutesLeft = IntTimer.getTimeValues().minutes;
  if ([9, 4, 0].includes(minutesLeft)) {
    notifyTimeLeft(minutesLeft + 1);
  }
});

// emit signal once interval timer is done (bring up overlay)
IntTimer.on("targetAchieved", () => {
  ipcRenderer.send("IntTimerDone");
});
// <<< Timer-related functions & event listeners for interval timer

// >>> notification functions
const icon = path.join(__dirname, "assets/eyes.png");
// timer notification on 10, 5, 1 minute mark
function notifyTimeLeft(minutesLeft) {
  const notif = new Notification({
    title: "eyePause",
    body: `You have ${minutesLeft} minute(s) left before your next break.`,
    icon: icon,
  });
  notif.show();
}

// notifying user that settings are saved
function notifySettingsSaved() {
  const notif = new Notification({
    title: "eyePause",
    body: "Settings saved, timer reset!",
    icon: icon,
  });
  notif.show();
}

// notifying user that timer is still paused
function notifyTimerPaused() {
  const notif = new Notification({
    title: "eyePause",
    body: "You've left eyePaused OFF! Click here to reenable it.",
    icon: icon,
  });
  notif.show();
  notif.on("click", () => {
    const win = remote.getCurrentWindow();
    win.show();
  });
  ``;
}
// <<< notification functions

// load onto input fields
inputBreakInt.value = store.get("BreakInt").toString();
inputBreakDur.value = store.get("BreakDur").toString();

// event listener for toggle button
// toggle timer state and app appearance
function toggleFunc() {
  if (toggler.checked == true) {
    document.body.style.backgroundColor = "#8de0ab";
    subtitle.innerHTML = "Bring justice back to your eyes!";
    IntTimer.start();
  } else {
    document.body.style.backgroundColor = "#e08d8d";
    subtitle.innerHTML = "eyePause is NOT enabled!";
    IntTimer.pause();
  }
}
toggler.addEventListener("click", toggleFunc);

// save options thru `electron-store` once pressed on button
saveButton.addEventListener("click", () => {
  store.set("BreakInt", parseInt(inputBreakInt.value));
  store.set("BreakDur", parseInt(inputBreakDur.value));
  // stop and run timer again (reset countdown)
  IntTimer.stop();
  startTimer();
  // send notification
  notifySettingsSaved();
  // switch toggler back to on state
  document.body.style.backgroundColor = "#8de0ab";
  subtitle.innerHTML = "Bring justice back to your eyes!";
  toggler.checked = true;
});

// exit once pressed on button
exitButton.addEventListener("click", () => {
  // dialogue box for confirmation
  ipcRenderer.send("exitConfirm");
});

// hide window to tray
closeButton.addEventListener("click", () => {
  const win = remote.getCurrentWindow();
  win.hide();
  // notify user if timer is still paused
  if (IntTimer.isPaused()) {
    notifyTimerPaused();
  }
});
