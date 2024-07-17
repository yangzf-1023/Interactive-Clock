// 每次刷新都清除之前的轮数
sessionStorage.removeItem('turnsOfHour');
sessionStorage.removeItem('turnsOfSecond');
sessionStorage.removeItem('turnsOfHour');
// 两个按钮的常值引用
const setButton = document.querySelector("input#set");
const resetButton = document.querySelector("input#reset");
const pauseButton = document.querySelector("input#pause");
// 设置时间的三个文本框
const hourPlace = document.querySelector('#hour_place');
const minutePlace = document.querySelector('#minute_place');
const secondPlace = document.querySelector('#second_place');
// 正则表达式
const hourRegex = new RegExp("[0-1]\\d|2[0-3]");
const minuteRegex = new RegExp("[0-5]\\d");
const secondRegex = new RegExp("[0-5]\\d");
const timeRegex = new RegExp("(?:[0-1]\\d|2[0-3]):[0-5]\\d:[0-5]\\d");

// 下面是实现秒针转动（秒针由三部分组成，因此是一个整体）
let secondHands = document.querySelectorAll('.second_hand');
// 分针转动
let minuteHand = document.querySelector('#minute_hand');
// 时针转动
let hourHand = document.querySelector('#hour_hand');

let isClockPaused = false;
let isClockRestarted = false;

let first = false;

// 点击设置
setButton.addEventListener('click', function () {
    // 设置的时间
    let setHour = hourPlace.value;
    let setMinute = minutePlace.value;
    let setSecond = secondPlace.value;
    // 格式正确
    if (hourRegex.test(setHour) && secondRegex.test(setSecond) && minuteRegex.test(setMinute)) {
        first = true;


        // 存储时间
        sessionStorage.setItem('setTime', setHour + ":" + setMinute + ":" + setSecond);
        // 清除之前积攒的轮数
        sessionStorage.removeItem('turnsOfHour');
        sessionStorage.removeItem('turnsOfSecond');
        sessionStorage.removeItem('turnsOfHour');
        let startTime = new Date();
        sessionStorage.setItem('startTime', String(startTime.getTime()));

        sessionStorage.removeItem('pauseTime');
    } else {
        alert("输入不合法！");
    }
})

// 点击重置
resetButton.addEventListener('click', function () {
    sessionStorage.removeItem('setTime');
    sessionStorage.removeItem('pauseTime');
})

pauseButton.addEventListener('click', function () {
    isClockPaused = !isClockPaused;
    if (isClockPaused) {
        pauseButton.value = "继续";
        hourPlace.disabled = false;
        minutePlace.disabled = false;
        secondPlace.disabled = false;
        // 起始的暂停时间
        sessionStorage.setItem("startPause", String(Date.now()));
    } else {
        pauseButton.value = "暂停";
        hourPlace.disabled = true;
        minutePlace.disabled = true;
        secondPlace.disabled = true;
        isClockRestarted = true;
    }
})

function changePerSecond() {
    // 停止时钟
    if (isClockPaused) {
        return;
    }

    // 默认时间是当前时间
    let current = new Date();
    let pauseTime = 0;

    // 如果时钟被暂停则重新计时
    if (isClockRestarted) {
        sessionStorage.setItem('endPause', String(Date.now()));
        // 结束暂停的时间
        pauseTime = Number(sessionStorage.getItem('endPause')) - Number(sessionStorage.getItem('startPause'));
        let accumulatePauseTime = sessionStorage.getItem('pauseTime');
        if (!accumulatePauseTime) {
            sessionStorage.setItem('pauseTime', String(pauseTime));
        }
        else {
            sessionStorage.setItem('pauseTime', String(Number(accumulatePauseTime) + pauseTime));
        }
        isClockRestarted = false;
    }

    // 如果设置了时间
    if (sessionStorage.getItem('setTime')) {
        // 将开始时间转换为字符串格式(这里还需要进行修改啊！)
        let setTime = new Date(current.toString().replace(timeRegex, sessionStorage.getItem('setTime')));

        // 首先确定时间差，秒形式
        let deltaTime = Date.now() - Number(sessionStorage.getItem('startTime'));

        if(first){
            sessionStorage.setItem('pauseTime', String(deltaTime));
            first = false;
        }


        current = new Date(setTime.getTime() + deltaTime - Number(sessionStorage.getItem('pauseTime')));

        console.log(setTime.getTime(),deltaTime, Number(sessionStorage.getItem('pauseTime')));
    }
    else {
        // 没有设置过时间
        current = new Date(Date.now() - Number(sessionStorage.getItem('pauseTime')));
    }

    // 更新初始内容
    let timeString = current.toLocaleTimeString();
    hourPlace.placeholder = timeString.slice(0, 2);
    hourPlace.value = timeString.slice(0, 2);
    minutePlace.placeholder = timeString.slice(3, 5);
    minutePlace.value = timeString.slice(3, 5);
    secondPlace.placeholder = timeString.slice(6, 8);
    secondPlace.value = timeString.slice(6, 8);

    // 获取积累的圈数
    if (!sessionStorage.getItem('turnsOfSecond')) {
        sessionStorage.setItem('turnsOfSecond', '0');
    }
    let turnsOfSecond = Number(sessionStorage.getItem('turnsOfSecond'));

    if (!sessionStorage.getItem('turnsOfMinute')) {
        sessionStorage.setItem('turnsOfMinute', '0');
    }
    let turnsOfMinute = Number(sessionStorage.getItem('turnsOfMinute'));

    if (!sessionStorage.getItem('turnsOfHour')) {
        sessionStorage.setItem('turnsOfHour', '0');
    }
    let turnsOfHour = Number(sessionStorage.getItem('turnsOfHour'));

    // 获取时、分、秒
    let seconds = current.getSeconds();
    let minutes = current.getMinutes();
    let hours = current.getHours() % 12;

    // 计算当圈的角度（<360）
    let angleOfSecond = 6 * seconds;
    let angleOfMinute = 6 * (minutes + seconds / 60);
    let angleOfHour = 30 * (hours + (minutes + seconds / 60) / 60);

    // 新的一圈更新圈数
    if (angleOfSecond === 0) {
        sessionStorage.setItem('turnsOfSecond', turnsOfSecond + 1);
    }

    if (angleOfMinute === 0) {
        sessionStorage.setItem('turnsOfMinute', turnsOfMinute + 1);
    }

    if (angleOfHour === 0) {
        sessionStorage.setItem('turnsOfHour', turnsOfHour + 1);
    }
    // 获取圈数
    turnsOfSecond = Number(sessionStorage.getItem('turnsOfSecond'));
    turnsOfMinute = Number(sessionStorage.getItem('turnsOfMinute'));
    turnsOfHour = Number(sessionStorage.getItem('turnsOfHour'));

    // rotate的角度必须是保证单调递增的，一旦减小就会逆时针旋转

    for (const item of secondHands) {
        item.style.setProperty('--degree', `${angleOfSecond + 360 * turnsOfSecond}deg`);
    }
    minuteHand.style.setProperty('--degree', `${angleOfMinute + 360 * turnsOfMinute}deg`);
    hourHand.style.setProperty('--degree', `${angleOfHour + 360 * turnsOfHour}deg`);
    const degreeValue = window.getComputedStyle(minuteHand).getPropertyValue('--degree');

    console.log(`The degree value is: ${degreeValue}`);
}

// 两次调用防止刷新
setInterval(changePerSecond, 1000);
changePerSecond();
