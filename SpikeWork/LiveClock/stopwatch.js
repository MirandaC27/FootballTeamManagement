let interval = null;
let status = "stopped";

let endTime = null;
let lapTimes = [];

function msToHMS(ms) {
    if (ms < 0) ms = 0;

    let totalSeconds = Math.floor(ms / 1000);

    const hours = Math.floor(totalSeconds / 3600);
    totalSeconds %= 3600;

    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return {
        hours,
        minutes,
        seconds,
        text:
            `${hours.toString().padStart(2, "0")}:` +
            `${minutes.toString().padStart(2, "0")}:` +
            `${seconds.toString().padStart(2, "0")}`
    };
}

function loadUserInputMS() {
    const hours = parseInt(document.getElementById("inputHours").value) || 0;
    const minutes = parseInt(document.getElementById("inputMinutes").value) || 0;
    const seconds = parseInt(document.getElementById("inputSeconds").value) || 0;

    return ((hours * 3600) + (minutes * 60) + seconds) * 1000;
}

function updateDisplayFromMS(ms) {
    const time = msToHMS(ms);
    document.getElementById("display").innerHTML = time.text;
}

function timerTick() {
    const now = Date.now();
    const remaining = endTime - now;

    updateDisplayFromMS(remaining);

    if (remaining <= 0) {
        clearInterval(interval);
        status = "stopped";
        document.getElementById("startStop").innerHTML = "Start";
    }
}

function startStop() {
    if (status === "stopped") {
        const durationMS = loadUserInputMS();
        if (durationMS <= 0) return;

        const now = Date.now();
        endTime = now + durationMS;

        interval = setInterval(timerTick, 200); 
        status = "started";
        document.getElementById("startStop").innerHTML = "Stop";
    } else {
        clearInterval(interval);
        status = "stopped";
        document.getElementById("startStop").innerHTML = "Start";
    }
}

function reset() {
    clearInterval(interval);

    status = "stopped";
    endTime = null;

    updateDisplayFromMS(0);

    document.getElementById("startStop").innerHTML = "Start";

    lapTimes = [];
    document.getElementById("laps").innerHTML = "";
}

function lap() {
    if (status !== "started") return;

    const remaining = endTime - Date.now();
    const time = msToHMS(remaining);

    lapTimes.push(time.text);

    const list = document.getElementById("laps");
    const item = document.createElement("li");
    item.textContent = `Lap ${lapTimes.length}: ${time.text}`;
    list.appendChild(item);
}

// Initialize display
updateDisplayFromMS(0);
