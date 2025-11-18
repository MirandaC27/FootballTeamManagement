// Clock.js — simple start/stop timer for match
let minutes = 0;
let seconds = 0;
let timerInterval = null;
let status = "stopped";
let currentMatchId = null;

let display;

//Format time MM:SS
function formatTime(mins, secs) {
    const mm = mins < 10 ? "0" + mins : mins;
    const ss = secs < 10 ? "0" + secs : secs;
    return `${mm}:${ss}`;
}

//Update the clock display
function updateDisplay() {
    display.textContent = formatTime(minutes, seconds);
}

//Tick every second 
function timerTick() {
    seconds++;
    if (seconds >= 60) {
        seconds = 0;
        minutes++;
    }
    updateDisplay();
}

/** Start or stop timer + notify backend */
export async function startStopClock() {
    if (status === "stopped") {

        // BACKEND: mark matchStart ===
        await fetch(`/match/start/${currentMatchId}`, {
            method: "POST"
        });

        timerInterval = setInterval(timerTick, 1000);
        status = "started";

    } else {

        //BACKEND: mark matchEnd
        await fetch(`/match/end/${currentMatchId}`, {
            method: "POST"
        });

        clearInterval(timerInterval);
        timerInterval = null;
        status = "stopped";
    }
}


export function resetClock() {
    clearInterval(timerInterval);
    timerInterval = null;
    status = "stopped";
    minutes = 0;
    seconds = 0;
    updateDisplay();
}


export function initClock(matchId) {
    currentMatchId = matchId;
    display = document.getElementById("matchClock");
    updateDisplay();
}
