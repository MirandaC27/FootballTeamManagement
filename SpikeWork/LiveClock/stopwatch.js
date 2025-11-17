let hours = 0;
let minutes = 0;
let seconds = 0;


let displayHours = "00";
let displayMinutes = "00";
let displaySeconds = "00";


let interval = null;
let status = "stopped";

let lapTimes = [];


function formatTime(h, m, s) {
    let hh = h < 10 ? "0" + h : h;
    let mm = m < 10 ? "0" + m : m;
    let ss = s < 10 ? "0" + s : s;
    return `${hh}:${mm}:${ss}`;
}

function loadUserInput() {
    const hourInput = parseInt(document.getElementById("inputHours").value) || 0;
    const minuteInput = parseInt(document.getElementById("inputMinutes").value) || 0;
    const secondInput = parseInt(document.getElementById("inputSeconds").value) || 0;

    hours = Math.max(0, hourInput);
    minutes = Math.max(0, minuteInput);
    seconds = Math.max(0, secondInput);

    updateDisplay();
}



function updateDisplay() {
    displayHours = hours < 10 ? "0" + hours : hours;
    displayMinutes = minutes < 10 ? "0" + minutes : minutes;
    displaySeconds = seconds < 10 ? "0" + seconds : seconds;

    document.getElementById("display").innerHTML =
        `${displayHours}:${displayMinutes}:${displaySeconds}`;
}

function timerTick() {

    if (hours === 0 && minutes === 0 && seconds === 0) {
        clearInterval(interval);
        status = "stopped";
        document.getElementById("startStop").innerHTML = "Start";
        return;
    }

    if (seconds === 0) {
        if (minutes === 0) {
            hours--;
            minutes = 59;
            seconds = 59;
        } else {
            minutes--;
            seconds = 59;
        }
    } else {
        seconds--;
    }

    updateDisplay();
}


function startStop(){

    if(status === "stopped"){

        loadUserInput(); 
       
        interval = window.setInterval(timerTick, 1000);
        document.getElementById("startStop").innerHTML = "Stop";
        status = "started";

    }
    else{

        window.clearInterval(interval);
        document.getElementById("startStop").innerHTML = "Start";
        status = "stopped";

    }

}


function reset() {
    window.clearInterval(interval);

    // Reset internal timer to 0
    hours = 0;
    minutes = 0;
    seconds = 0;

    updateDisplay();

    document.getElementById("startStop").innerHTML = "Start";
    status = "stopped";

    // clear laps
    lapTimes = [];
    document.getElementById("laps").innerHTML = "";
}

function lap() {
    if (status !== "started") return; // ignore if not running

    const lapTime = formatTime(hours, minutes, seconds);
    lapTimes.push(lapTime);

    const list = document.getElementById("laps");
    const item = document.createElement("li");
    item.textContent = `Lap ${lapTimes.length}: ${lapTime}`;
    list.appendChild(item);
}

updateDisplay();