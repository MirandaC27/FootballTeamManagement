// Clock.js — simple start/stop timer for match
let minutes = 0;
let seconds = 0;
let timerInterval = null;
let status = "stopped";

const display = document.getElementById("matchClock");

/** Format time MM:SS */
function formatTime(mins, secs) {
    const mm = mins < 10 ? "0" + mins : mins;
    const ss = secs < 10 ? "0" + secs : secs;
    return `${mm}:${ss}`;
}

/** Update the clock display */
function updateDisplay() {
    display.textContent = formatTime(minutes, seconds);
}

/** Tick every second */
function timerTick() {
    seconds++;
    if (seconds >= 60) {
        seconds = 0;
        minutes++;
    }
    updateDisplay();
}

/** Start or stop the timer */
export function startStopClock() {
    if (status === "stopped") {
        timerInterval = setInterval(timerTick, 1000);
        status = "started";
    } else {
        clearInterval(timerInterval);
        timerInterval = null;
        status = "stopped";
    }
}

/** Reset the timer */
export function resetClock() {
    clearInterval(timerInterval);
    timerInterval = null;
    status = "stopped";
    minutes = 0;
    seconds = 0;
    updateDisplay();
}

/** Initialize clock display */
export function initClock() {
    updateDisplay();
}
