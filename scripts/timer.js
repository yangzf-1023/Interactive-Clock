// 三个文本框
const hourForTimer = document.querySelector('#hour_place_timer');
const minuteForTimer = document.querySelector('#minute_place_timer');
const secondForTimer = document.querySelector('#second_place_timer');
// 按钮
const startBtnForTimer = document.querySelector('#start_timer');
const pauseBtnForTimer = document.querySelector('#pause_timer');
const cancelBtnForTimer = document.querySelector('#cancel_timer');

const inputForTimer = [hourForTimer, minuteForTimer, secondForTimer];

// 
let endTime;
let timerIntervalForTimer = null;
let isTimerPaused = false;
let isTimerStarted = false;

startBtnForTimer.addEventListener('click', function (event) {
    if(isTimerStarted){
        alert('计时器运行中');
        return;
    }
    if (hourRegex.test(hourForTimer.value) && minuteRegex.test(minuteForTimer.value) && secondRegex.test(secondForTimer.value)) {
        isTimerStarted = true;
        endTime = Date.now()+(Number(hourForTimer.value)*60*60+Number(minuteForTimer.value)*60+Number(secondForTimer.value))*1000;
        changePerSecondForTimer();
        timerIntervalForTimer = setInterval(changePerSecondForTimer, 1000);
    }
    else {
        for(const inputPlace of inputForTimer){
            inputPlace.value = '';
        }
        alert('输入非法!');
    }
});

cancelBtnForTimer.addEventListener('click', function() { 
    // 清空所有数据
    sessionStorage.removeItem('accumulatePauseTimeForTimer');
    sessionStorage.removeItem('startTimerPause');
    for(const inputPlace of inputForTimer){
        inputPlace.value = '';
    }
    isTimerStarted = false;
    if(timerIntervalForTimer){
        clearInterval(timerIntervalForTimer);
    }
});

pauseBtnForTimer.addEventListener('click', function(){
    isTimerPaused = !isTimerPaused;
    // 如果暂停了
    if(isTimerPaused){
        console.log('happy');
        // 记录暂停的时刻
        sessionStorage.setItem('startTimerPause',String(Date.now()));
        pauseBtnForTimer.textContent = '继续';
    }
    // 如果是恢复
    else{
        // 暂停了多长时间
        let currentPauseTime = Date.now() - Number(sessionStorage.getItem('startTimerPause'));
        let accumulatePauseTime = sessionStorage.getItem('accumulatePauseTimeForTimer');
        console.log(currentPauseTime,accumulatePauseTime );
        if(!accumulatePauseTime ){
            sessionStorage.setItem('accumulatePauseTimeForTimer', String(currentPauseTime));
        }
        else{
            sessionStorage.setItem('accumulatePauseTimeForTimer', String(Number(currentPauseTime) + Number(accumulatePauseTime)));
        }
        pauseBtnForTimer.textContent = '暂停';
    }
});

function changePerSecondForTimer(){
    if(isTimerPaused){
        return;
    }
    let current = new Date();
    // 时间差
    let currentOffset = endTime - current.getTime();

    console.log(endTime, current.getTime(), currentOffset);

    
    if(sessionStorage.getItem('accumulatePauseTimeForTimer')){
        currentOffset += Number(sessionStorage.getItem('accumulatePauseTimeForTimer'));
    }
    // 时区差异
    let timeZoneOffset = current.getTimezoneOffset()*60*1000;

    console.log(currentOffset, timeZoneOffset);


    if (currentOffset > 0){
        let currentTime = new Date(currentOffset + timeZoneOffset);
        // let currentTime = new Date(currentOffset );
        // console.log(currentTime);
        hourForTimer.value = String(currentTime.getHours()).padStart(2, '0');
        minuteForTimer.value = String(currentTime.getMinutes()).padStart(2, '0');
        secondForTimer.value = String(currentTime.getSeconds()).padStart(2, '0');
    }
    else{
        // 弹出时间到了
        isTimerStarted = false;

        // 清空所有数据
        sessionStorage.removeItem('accumulatePauseTimeForTimer');
        sessionStorage.removeItem('startTimerPause');
        alert('时间到!');
    }
}

