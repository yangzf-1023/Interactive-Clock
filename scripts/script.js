const timeContent = document.querySelector("div#digit");

// 进行修改

// 首先获得起始时间


// 每次刷新都清除之前的轮数
// 除此以外，每次设定时间或者是恢复默认时间，都应该清楚之前积攒的轮数
sessionStorage.removeItem('turnsOfHour');
sessionStorage.removeItem('turnsOfSecond');
sessionStorage.removeItem('turnsOfHour');


function changePerSecond() {
    // 默认时间是当前时间
    let current = new Date();
    timeContent.textContent = current.toLocaleTimeString();
    // todo:从文本框读取时间信息

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

    // 下面是实现秒针转动（秒针由三部分组成，因此是一个整体）
    let secondHands = document.querySelectorAll('.second_hand');

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
    turnsOfSecond = Number(sessionStorage.getItem('turnsOfSecond'));
    turnsOfMinute = Number(sessionStorage.getItem('turnsOfMinute'));
    turnsOfHour = Number(sessionStorage.getItem('turnsOfHour'));

    // rotate的角度必须是保证单调递增的，一旦减小就会逆时针旋转

    for (const item of secondHands) {
        item.style.setProperty('--degree', `${angleOfSecond + 360 * turnsOfSecond}deg`);
    }

    // 分针转动
    let minuteHand = document.querySelector('#minute_hand');
    minuteHand.style.setProperty('--degree', `${angleOfMinute + 360 * turnsOfMinute}deg`);

    // 时针转动
    let hourHand = document.querySelector('#hour_hand');
    hourHand.style.setProperty('--degree', `${angleOfHour + 360 * turnsOfHour}deg`);
}

// 两次调用防止刷新
setInterval(changePerSecond, 1000);
changePerSecond();