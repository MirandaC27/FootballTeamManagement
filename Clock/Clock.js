// Clock.js — automatic match timer controlled by scheduled start time & duration

let startTimestamp = null;
let durationMs = null;
let timer = null;

const display = document.getElementById("matchClock");

/** Format ms → MM:SS */
function fmt(ms) {
    if (ms < 0) ms = 0;
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60).toString().padStart(2, "0");
    const sec = (s % 60).toString().padStart(2, "0");
    return `${m}:${sec}`;
}

/** Update UI every second */
function tick() {
    const now = Date.now();
    const elapsed = now - startTimestamp;

    if (durationMs && elapsed >= durationMs) {
        display.textContent = fmt(durationMs);
        clearInterval(timer);
        timer = null;
        return;
    }

    display.textContent = fmt(elapsed);
}

/**
 * Called by matchviewer.html
 * @param {number} scheduledStartMs - when match is supposed to start
 * @param {number|null} setDurationMs - duration in milliseconds
 * @param {string} matchStatus - text such as "Offline", "In Progress", "Final"
 */
export function loadClockState(scheduledStartMs, setDurationMs, matchStatus) {
    startTimestamp = scheduledStartMs;
    durationMs = setDurationMs ?? null;

    const now = Date.now();

    // Before match start
    if (now < startTimestamp) {
        display.textContent = "00:00";
        return;
    }

    // After match already ended
    if (matchStatus === "Final") {
        if (durationMs) display.textContent = fmt(durationMs);
        return;
    }

    // Match is live or should be live
    startClock();
}

/** Begin ticking */
export function startClock() {
    if (timer) return;
    timer = setInterval(tick, 1000);
    tick();
}
