let startTime_Clock;
let updatedTime_Clock;
let difference;
let lastLapTime = 0;
let timerInterval;
let running = false;
let lapTimes = [];

const stopWatchDisplayElement = document.getElementById('stopWatchDisplay');
const startStopWatchButton = document.getElementById('start_stopWatch');
const resetStopWatchButton = document.getElementById('reset_stopWatch');
const stopWatchList = document.getElementById('stopWatchList');

startStopWatchButton.addEventListener('click', () => {
    if (!running) {
        startTime_Clock = new Date().getTime() - (difference || 0);
        timerInterval = setInterval(updateTimer, 10);
        startStopWatchButton.textContent = '暂停';
        resetStopWatchButton.textContent = '分段';
        running = true;
    } else {
        clearInterval(timerInterval);
        startStopWatchButton.textContent = '开始';
        resetStopWatchButton.textContent = '复位';
        running = false;
    }
});

resetStopWatchButton.addEventListener('click', () => {
    if (!running) {
        clearInterval(timerInterval);
        difference = 0;
        lastLapTime = 0;
        running = false;
        startStopWatchButton.textContent = '开始';
        stopWatchDisplayElement.textContent = '00:00.00';
        stopWatchList.innerHTML = '';
        lapTimes = [];
    } else {
        const currentTime = difference;
        const lapTime = currentTime - lastLapTime;
        lapTimes.push(lapTime);
        lastLapTime = currentTime;
        updateLaps();
    }
});


function updateTimer() {
    updatedTime_Clock = new Date().getTime();
    difference = updatedTime_Clock - startTime_Clock;
    stopWatchDisplayElement.textContent = formatTime(difference);
}

function formatTime(time) {
    const hours = Math.floor(time / 3600000).toString().padStart(2, '0');
    const minutes = Math.floor((time % 3600000) / 60000).toString().padStart(2, '0');
    const seconds = Math.floor((time % 60000) / 1000).toString().padStart(2, '0');
    const milliseconds = Math.floor((time % 1000) / 10).toString().padStart(2, '0');

    return `${minutes}:${seconds}.${milliseconds}`;
}

function updateLaps() {
    stopWatchList.innerHTML = '';

    let longestLap = Math.max(...lapTimes);
    let shortestLap = Math.min(...lapTimes);

    lapTimes.forEach((lapTime, index) => {
        const lapTimeFormatted = formatTime(lapTime);
        const li = document.createElement('li');
        li.textContent = `分段${index + 1}  ${lapTimeFormatted}`;
        if(lapTimes.length > 2){
            if (lapTime === longestLap) {
                li.style.color = 'red';
            } else if (lapTime === shortestLap) {
                li.style.color = 'green';
            }
        }
        stopWatchList.appendChild(li);
    });
}
