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

function stopWatch(){
    //always increment seconds
    seconds++;

    //minutes
    if(seconds / 60 === 1){
        seconds = 0;
        minutes++;

        if(minutes / 60 === 1){
            minutes = 0;
            hours++;
        }

    }

    //display strings for time
    if(seconds < 10){
        displaySeconds = "0" + seconds.toString();
    }
    else{
        displaySeconds = seconds;
    }

    if(minutes < 10){
        displayMinutes = "0" + minutes.toString();
    }
    else{
        displayMinutes = minutes;
    }

    if(hours < 10){
        displayHours = "0" + hours.toString();
    }
    else{
        displayHours = hours;
    }

    //Display updated time values to user
    document.getElementById("display").innerHTML =  `${displayHours}:${displayMinutes}:${displaySeconds}`;
}



function startStop(){

    if(status === "stopped"){

       
        interval = window.setInterval(stopWatch, 1000);
        document.getElementById("startStop").innerHTML = "Stop";
        status = "started";

    }
    else{

        window.clearInterval(interval);
        document.getElementById("startStop").innerHTML = "Start";
        status = "stopped";

    }

}


function reset(){

    window.clearInterval(interval);

    hours = 0;
    minutes = 0;
    seconds = 0;

    document.getElementById("display").innerHTML = "00:00:00";
    document.getElementById("startStop").innerHTML = "Start";


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