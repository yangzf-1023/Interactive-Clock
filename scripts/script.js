// 每次刷新都清除之前的轮数
sessionStorage.removeItem('turnsOfHour');
sessionStorage.removeItem('turnsOfSecond');
sessionStorage.removeItem('turnsOfHour');

const svgElement = document.getElementById("interactiveClock");

// 两个按钮的常值引用
const setButton = document.querySelector("input#set");
const resetButton = document.querySelector("input#reset");
const pauseButton = document.querySelector("input#pause");
// 设置时间的三个文本框
const hourPlace = document.querySelector('#hour_place');
const minutePlace = document.querySelector('#minute_place');
const secondPlace = document.querySelector('#second_place');
// 存储所有闹钟时间的数组
let alarmTimes = [];
// 获取闹钟输入框和按钮
const alarmHour = document.querySelector('#alarm_hour');
const alarmMinute = document.querySelector('#alarm_minute');
const setAlarmButton = document.querySelector('#set_alarm');
const cancelAlarmButton = document.querySelector('#cancel_alarm');
// 正则表达式
const hourRegex = new RegExp("[0-1]\\d|2[0-3]");
const minuteRegex = new RegExp("[0-5]\\d");
const secondRegex = new RegExp("[0-5]\\d");
const timeRegex = new RegExp("(?:[0-1]\\d|2[0-3]):[0-5]\\d:[0-5]\\d");
const alarmRegex = new RegExp("(?:[0-1]\\d|2[0-3]):[0-5]\\d");

// 下面是实现秒针转动（秒针由三部分组成，因此是一个整体）
let secondHands = document.querySelectorAll('.second_hand');
// 分针转动
let minuteHand = document.querySelector('#minute_hand');
// 时针转动
let hourHand = document.querySelector('#hour_hand');

// 时钟是否被暂停
let isClockPaused = false;
// 是否被重启
let isClockRestarted = false;
// 是否是设置后的第一次
let firstTimeAfterSet = false;

// 点击设置
setButton.addEventListener('click', function () {
    // 设置的时间
    let setHour = hourPlace.value;
    let setMinute = minutePlace.value;
    let setSecond = secondPlace.value;
    // 格式正确
    if (hourRegex.test(setHour) && secondRegex.test(setSecond) && minuteRegex.test(setMinute)) {
        firstTimeAfterSet = true;
        // 存储时间
        sessionStorage.setItem('setTime', setHour + ":" + setMinute + ":" + setSecond);
        // 清除之前积攒的轮数
        sessionStorage.removeItem('turnsOfHour');
        sessionStorage.removeItem('turnsOfSecond');
        sessionStorage.removeItem('turnsOfHour');
        // 记录开始设置的时间
        sessionStorage.setItem('startTime', String(Date.now()));
        // 清除已经积累的暂停时间
        sessionStorage.removeItem('pauseTime');
    } else {
        alert("输入非法！");
    }
})

// 点击重置
resetButton.addEventListener('click', function () {
    // 清除之前积攒的轮数
    sessionStorage.removeItem('turnsOfHour');
    sessionStorage.removeItem('turnsOfSecond');
    sessionStorage.removeItem('turnsOfHour');
    // 清除设置的时间
    sessionStorage.removeItem('setTime');
    // 清除积累的暂停时间
    sessionStorage.removeItem('pauseTime');
})

// 暂停或继续
pauseButton.addEventListener('click', function () {
    // 更新暂停状态
    isClockPaused = !isClockPaused;
    if (isClockPaused) {
        // 已经暂停了
        pauseButton.value = "继续";
        hourPlace.disabled = false;
        minutePlace.disabled = false;
        secondPlace.disabled = false;
        // 起始的暂停时间
        sessionStorage.setItem("startPause", String(Date.now()));

        svgElement.classList.add("clockStopped");
        svgElement.classList.remove("clockNotStopped");
    } else {
        pauseButton.value = "暂停";
        hourPlace.disabled = true;
        minutePlace.disabled = true;
        secondPlace.disabled = true;
        isClockRestarted = true;
        // 暂停的终止时间
        sessionStorage.setItem('endPause', String(Date.now()));

        svgElement.classList.add("clockNotStopped");
        svgElement.classList.remove("clockStopped");
    }
})

setAlarmButton.addEventListener('click', function () {
    let alarmHourValue = alarmHour.value;
    let alarmMinuteValue = alarmMinute.value;
    if (alarmRegex.test(alarmHourValue + ":" + alarmMinuteValue)) {
        let alarmTime = {
            hour: parseInt(alarmHourValue),
            minute: parseInt(alarmMinuteValue),
            active: true, // 闹钟默认为开启状态
            dateTime: new Date().setHours(parseInt(alarmHourValue), parseInt(alarmMinuteValue), 0) // 设置具体时间
        };

        // 检查这个时间是否已经设置为闹钟
        let existingAlarm = alarmTimes.find(alarm => 
            alarm.hour === alarmTime.hour && alarm.minute === alarmTime.minute
        );

        if (!existingAlarm) {
            // 如果没有重复的闹钟，添加到列表
            alarmTimes.push(alarmTime);
            updateAlarmDisplay(); // 更新显示
            alarmHour.value = "";
            alarmMinute.value = "";
            // console.log('Alarm set at:', new Date(alarmTime.dateTime).toLocaleTimeString());
        } else {
            // 如果存在重复的闹钟，提醒用户
            // console.log('This time already has an alarm.');
            alert("已设置相同时间的闹钟！");
        }
    } else {
        alert("输入非法！");
    }
});

// 触发特定闹钟提醒
function triggerAlarm(alarmTimeIndex) {
    const alarmTime = alarmTimes[alarmTimeIndex];
    // 播放音频
    var audio = document.getElementById('alarmSound');
    audio.play();
    // 获取模态对话框元素
    var dialog = document.querySelector('.dialog-component');
    // 显示模态对话框
    dialog.style.display = 'block';
    // 更新模态对话框中的提醒信息
    document.querySelector('.dialog-container').textContent = `闹钟${alarmTimeIndex + 1}响起！时间：${new Date(alarmTime.dateTime).toLocaleTimeString()}`;
    // 为关闭按钮添加事件监听器
    document.getElementById('dialogSureBtn').addEventListener('click', function() {
        // 隐藏模态对话框
        dialog.style.display = 'none';
        // 停止音频
        audio.pause();
    });
    alarmTimes[alarmTimeIndex].active = false;
    updateAlarmDisplay();
}

function updateAlarmDisplay() {
    const alarmList = document.getElementById('alarmList');
    alarmList.innerHTML = ''; // 清空现有闹钟项

    alarmTimes.forEach((alarm, index) => {
        let item = document.createElement('li');
        item.className = 'list-group-item list-group-item-action';
        item.id = 'alarmItem_' + index;
        // 格式化时间显示
        let alarmTimeText = `${alarm.hour.toString().padStart(2, '0')}:${alarm.minute.toString().padStart(2, '0')}`;
        // 创建开启/关闭按钮
        let toggleButton = document.createElement('button');
        toggleButton.className = `btn alarmItemBtn ${alarm.active ? 'btn-outline-success' : 'btn-outline-danger'}`;
        toggleButton.textContent = alarm.active ? '已开启' : '已关闭';
        // 为切换按钮添加事件监听器
        toggleButton.addEventListener('click', function() {
            alarm.active = !alarm.active;
            updateAlarmDisplay(); // 更新闹钟显示状态
        });
        // 创建删除按钮
        const closeButton = document.createElement('span');
        closeButton.innerHTML = '&times;';
        closeButton.className = 'close';
        closeButton.onclick = function() {
            // 从数组和显示中移除这个闹钟
            alarmTimes.splice(index, 1);
            updateAlarmDisplay();
        };
        item.innerHTML = `闹钟${index + 1}: <span class="alarmTime">${alarmTimeText}</span> `;
        item.appendChild(toggleButton);
        item.appendChild(closeButton);
        alarmList.appendChild(item);
    });
}

// 更新时钟时检查闹钟
function checkAlarm() {
    const nowHour = parseInt(hourPlace.value);
    const nowMinute = parseInt(minutePlace.value);
    const nowSecond = parseInt(secondPlace.value);
    // 复制 alarmTimes 数组以避免直接修改原始数组
    let currentAlarmTimes = [...alarmTimes];
    currentAlarmTimes.forEach((alarmTime, index) => {
        // 对秒数进行了限制
        if (alarmTime.active && nowHour === alarmTime.hour && nowMinute === alarmTime.minute && nowSecond <= 10) {
            triggerAlarm(index); // 触发提醒
        }
    });
}

function changePerSecond() {
    // 停止时钟
    if (isClockPaused) {
        return;
    }

    // 检查闹钟
    checkAlarm();

    // 默认时间是当前时间

    let pauseTime = 0;
    let current;

    // 如果时钟被暂停则重新计时
    if (isClockRestarted) {

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
        current = new Date();
        let offset = current.getTime() % 1000;
        // 将开始时间转换为字符串格式
        let setTime = new Date(current.toString().replace(timeRegex, sessionStorage.getItem('setTime')));
        // 首先确定时间差，秒形式
        let deltaTime = Date.now() - Number(sessionStorage.getItem('startTime'));
        // 如果是第一次
        if (firstTimeAfterSet) {
            // 如果是第一次，补齐差的时间
            sessionStorage.setItem('pauseTime', String(deltaTime));
            firstTimeAfterSet = false;
        }
        // 更新后的时间
        current = new Date(setTime.getTime() + offset + deltaTime - Number(sessionStorage.getItem('pauseTime')));
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

    // console.log(`The degree value is: ${degreeValue}`);
}

// 两次调用防止刷新
setInterval(changePerSecond, 1000);
changePerSecond();
