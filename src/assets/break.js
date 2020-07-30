const { remote } = require("electron");
const { Timer } = require("easytimer.js");
const BkTimer = new Timer({ countdown: true });
const Store = require("electron-store");
const store = new Store({ defaults: { BreakInt: 30, BreakDur: 5, Skips: 0 } });

const quitEarly = document.getElementById("quitEarly");
const breakSkipCounter = document.getElementById("breakSkipCounter");

function startTimer() {
  BkTimer.start({ startValues: { minutes: store.get("BreakDur") } });
}
startTimer();

function checkSkips() {
  const skips = store.get("Skips");
  if (skips >= 2) {
    quitEarly.setAttribute("disabled", true);
    breakSkipCounter.innerHTML = "You have no remaining break skips";
    quitEarly.innerHTML = "No more remaining break skips";
    store.set("Skips", 0);
  } else {
    breakSkipCounter.innerHTML = `You have ${2 - skips} break skip(s) remaining`;
  }
}
checkSkips();

const breakTimer = document.getElementById("breakTimer");
BkTimer.on("secondsUpdated", () => {
  breakTimer.innerHTML = BkTimer.getTimeValues().toString();
});

BkTimer.on("targetAchieved", () => {
  remote.getCurrentWindow().close();
});

quitEarly.addEventListener("click", () => {
  store.set("Skips", store.get("Skips") + 1);
  remote.getCurrentWindow().close();
});
