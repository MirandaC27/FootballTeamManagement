let startTimestamp = null;        
let elapsedBeforeStart = 0;       
let interval = null;
let status = "stopped";
let currentMatchId = null;

let displayEl;
const socket = window.socket;


function msToClock(ms) {
    if (ms < 0) ms = 0;

    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return (
        minutes.toString().padStart(2, "0") +
        ":" +
        seconds.toString().padStart(2, "0")
    );
}

function updateDisplayFromMS(ms) {
    if (!displayEl) return;
    displayEl.textContent = msToClock(ms);
}


function timerTick() {
    if (status !== "started" || startTimestamp == null) return;

    const now = Date.now();
    const elapsed = (now - startTimestamp) + elapsedBeforeStart;

    updateDisplayFromMS(elapsed);
}


export async function startStopClock() {
    if (!currentMatchId) return;

    if (status === "stopped") {
        // Tell backend to start
        await fetch(`/match/start/${currentMatchId}`, { method: "POST" });

        startTimestamp = Date.now();
        status = "started";

        interval = setInterval(timerTick, 200);

    } else {
        // Tell backend to stop
        await fetch(`/match/end/${currentMatchId}`, { method: "POST" });

        const now = Date.now();
        elapsedBeforeStart += (now - startTimestamp);

        clearInterval(interval);
        interval = null;

        status = "stopped";
    }
}

export async function resetClock() {
    if (!currentMatchId) return;

    await fetch(`/match/reset/${currentMatchId}`, { method: "POST" });

    clearInterval(interval);
    interval = null;

    status = "stopped";
    startTimestamp = null;
    elapsedBeforeStart = 0;

    updateDisplayFromMS(0);
}


export function initClock(matchId) {
    currentMatchId = matchId;
    displayEl = document.getElementById("matchClock");

    updateDisplayFromMS(0);

    // Ask backend for the current clock state when entering page
    socket.emit("clock:requestState", currentMatchId);

    // Receive initial state
    socket.on("clock:state", ({ matchId: id, status: st, startTimestamp: ts, elapsedBeforeStart: before }) => {
        if (id !== currentMatchId) return;

        status = st;
        startTimestamp = ts;
        elapsedBeforeStart = before;

        clearInterval(interval);

        if (status === "started") {
            interval = setInterval(timerTick, 200);
        } 

        else {
            updateDisplayFromMS(before);
        }
    });

    socket.on("clock:start", ({ matchId: id, startTimestamp: ts, elapsedBeforeStart: before }) => {
        if (id !== currentMatchId) return;

        status = "started";
        startTimestamp = ts;
        elapsedBeforeStart = before;

        clearInterval(interval);
        interval = setInterval(timerTick, 200);
    });

    socket.on("clock:stop", ({ matchId: id, elapsedBeforeStart: before }) => {
        if (id !== currentMatchId) return;

        status = "stopped";
        elapsedBeforeStart = before;

        clearInterval(interval);
        interval = null;

        updateDisplayFromMS(before);
    });

    socket.on("clock:reset", ({ matchId: id }) => {
        if (id !== currentMatchId) return;

        status = "stopped";
        startTimestamp = null;
        elapsedBeforeStart = 0;

        clearInterval(interval);
        interval = null;

        updateDisplayFromMS(0);
    });
}
