const { remote } = require("electron");
const { Timer } = require("easytimer.js");
const BkTimer = new Timer({ countdown: true });
const Store = require("electron-store");
const store = new Store({ defaults: { BreakInt: 30, BreakDur: 5 } });

const quitEarly = document.getElementById("quitEarly");

function startTimer() {
  BkTimer.start({ startValues: { minutes: store.get("BreakDur") } });
}
startTimer();

const breakTimer = document.getElementById("breakTimer");
BkTimer.on("secondsUpdated", () => {
  breakTimer.innerHTML = BkTimer.getTimeValues().toString();
});

BkTimer.on("targetAchieved", () => {
  remote.getCurrentWindow().close();
});

quitEarly.addEventListener("click", () => {
  remote.getCurrentWindow().close();
});
