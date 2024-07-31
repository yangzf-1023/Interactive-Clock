// 三个文本框
const hourForTimer = document.querySelector('#hour_place_timer');
const minuteForTimer = document.querySelector('#minute_place_timer');
const secondForTimer = document.querySelector('#second_place_timer');
// 按钮
const startBtnForTimer = document.querySelector('#start_timer');
const pauseBtnForTimer = document.querySelector('#pause_timer');
const cancelBtnForTimer = document.querySelector('#cancel_timer');
// 文本框列表
const inputForTimer = [hourForTimer, minuteForTimer, secondForTimer];
// 计算出来的计时器应该停止的时刻
let endTime;
let timerIntervalForTimer = null;
// 计时器是否暂停
let isTimerPaused = false;
// 计时器是否继续
let isTimerStarted = false;

// 开始倒计时
startBtnForTimer.addEventListener('click', function (event) {
    // 不能同时有多个计时
    if (isTimerStarted) {
        alert('计时器运行中');
        return;
    }
    if (hourRegex.test(hourForTimer.value) && minuteRegex.test(minuteForTimer.value) && secondRegex.test(secondForTimer.value)) {
        isTimerStarted = true;
        // console.log(Date.now());
        endTime = Date.now() + (Number(hourForTimer.value) * 60 * 60 + Number(minuteForTimer.value) * 60 + Number(secondForTimer.value)) * 1000 + 1000;
        // changePerSecondForTimer();
        timerIntervalForTimer = setInterval(changePerSecondForTimer, 1000);
    } else {
        for (const inputPlace of inputForTimer) {
            inputPlace.value = '';
        }
        alert('输入非法!');
    }
});

// 取消计时
cancelBtnForTimer.addEventListener('click', function () {
    // 还原暂停重启
    if (isTimerPaused) {
        isTimerPaused = false;
        pauseBtnForTimer.textContent = '暂停';
    }
    // 清空所有数据
    sessionStorage.removeItem('accumulatePauseTimeForTimer');
    sessionStorage.removeItem('startTimerPause');
    for (const inputPlace of inputForTimer) {
        inputPlace.value = '';
    }
    isTimerStarted = false;
    if (timerIntervalForTimer) {
        clearInterval(timerIntervalForTimer);
        timerIntervalForTimer = null;
    }
});

// 暂停计时
pauseBtnForTimer.addEventListener('click', function () {
    isTimerPaused = !isTimerPaused;
    // 如果暂停了
    if (isTimerPaused) {
        // console.log('happy');
        // 记录暂停的时刻
        sessionStorage.setItem('startTimerPause', String(Date.now()));
        pauseBtnForTimer.textContent = '继续';
    }
    // 如果是恢复
    else {
        // 暂停了多长时间
        let currentPauseTime = Date.now() - Number(sessionStorage.getItem('startTimerPause'));
        let accumulatePauseTime = sessionStorage.getItem('accumulatePauseTimeForTimer');
        // console.log(currentPauseTime, accumulatePauseTime);
        if (!accumulatePauseTime) {
            sessionStorage.setItem('accumulatePauseTimeForTimer', String(currentPauseTime));
        } else {
            sessionStorage.setItem('accumulatePauseTimeForTimer', String(Number(currentPauseTime) + Number(accumulatePauseTime)));
        }
        pauseBtnForTimer.textContent = '暂停';
    }
});

// 每秒更新显示
function changePerSecondForTimer() {
    // 暂停直接略过
    if (isTimerPaused) {
        return;
    }
    let current = new Date();
    // 时间差
    let currentOffset = endTime - current.getTime();
    // console.log(current.getTime());
    if (sessionStorage.getItem('accumulatePauseTimeForTimer')) {
        currentOffset += Number(sessionStorage.getItem('accumulatePauseTimeForTimer'));
    }
    // 时区差异
    let timeZoneOffset = current.getTimezoneOffset() * 60 * 1000;
    // console.log(currentOffset, timeZoneOffset);
    // 如果还没到时间
    if (currentOffset > 0) {
        let currentTime = new Date(currentOffset + timeZoneOffset);
        hourForTimer.value = String(currentTime.getHours()).padStart(2, '0');
        minuteForTimer.value = String(currentTime.getMinutes()).padStart(2, '0');
        secondForTimer.value = String(currentTime.getSeconds()).padStart(2, '0');
    } else {
        // 还原暂停重启
        if (isTimerPaused) {
            isTimerPaused = false;
            pauseBtnForTimer.textContent = '暂停';
        }
        // 清空所有数据
        sessionStorage.removeItem('accumulatePauseTimeForTimer');
        sessionStorage.removeItem('startTimerPause');
        for (const inputPlace of inputForTimer) {
            inputPlace.value = '';
        }
        isTimerStarted = false;
        if (timerIntervalForTimer) {
            clearInterval(timerIntervalForTimer);
        }
        triggerTimerAlarm();
    }
}

// 获取音频元素
var audio = document.getElementById('alarmSound');

// 获取模态对话框元素
var dialog = document.querySelector('#dialog_timer');

// 定义触发提醒的函数
function triggerTimerAlarm() {
    // 播放音频
    audio.play();
    // 显示模态对话框
    dialog.style.display = 'block';
    // 更新模态对话框中的提醒信息
    document.querySelector('.dialog-container').textContent = '计时器时间到';
    // 为关闭按钮添加事件监听器
    document.getElementById('dialogSureBtn_timer').addEventListener('click', function () {
        // 隐藏模态对话框
        dialog.style.display = 'none';
        // 停止音频
        audio.pause();
    });
}

