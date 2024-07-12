const timeContent = document.querySelector("div#digit");

// 进行修改

// 首先获得起始时间

// 默认时间是当前时间
let current = new Date();
timeContent.textContent = current.toLocaleTimeString();
// 从文本框读取时间

// // 秒钟数的字符串
// let seconds = Number(timeContent.textContent.slice(6, 8));
// let minutes = Number(timeContent.textContent.slice(3, 5));
// let hours = Number(timeContent.textContent.slice(0, 2));

// // 下面是实现秒针转动（秒针由三部分组成，因此是一个整体）
// let secondHands = document.querySelectorAll('.second_hand');

// for (item of secondHands) {
//     item.style.transform =  `rotate(${6 * seconds}, 260 260)`;
// }

// // 分针转动
// let minuteHand = document.querySelector('#minute_hand');
// minuteHand.style.transform = `rotate(${(6 * (minutes + seconds / 60)) % 360}, 260 260)`;

// // 时针转动
// let hourHand = document.querySelector('#hour_hand');
// hourHand.style.transform = `rotate(${(30 * (hours + (minutes + seconds / 60) / 60)) % 360}, 260 260)`;


function changePerSecond() {
    // nihao
    // 默认时间是当前时间
    let current = new Date();
    timeContent.textContent = current.toLocaleTimeString();
    // 从文本框读取时间信息

    // 秒钟数的字符串
    let seconds = current.getSeconds();
    let minutes = current.getMinutes();
    let hours = current.getHours() % 12;

    // 下面是实现秒针转动（秒针由三部分组成，因此是一个整体）
    let secondHands = document.querySelectorAll('.second_hand');

    // 计算角度，这里还需要修改，每次要加上之前累积的角度
    let angleOfSecond = 6 * seconds;
    let angleOfMinute = 6 * (minutes + seconds / 60);
    let angleOfHour = 30 * (hours + (minutes + seconds / 60) / 60);


    // 旋转角度的设置有问题

    if(angleOfSecond === 59){
        if(!localStorage.getItem('angleOfSecond')){
            localStorage.setItem('angleOfSecond', String(angleOfSecond));
        }
        localStorage.setItem('angleOfSecond', String(angleOfSecond))
    }

    // 角度的值应该存起来


    for (const item of secondHands) {
        item.setAttribute('transform', `rotate(${angleOfSecond})`);
    }

    // 分针转动
    let minuteHand = document.querySelector('#minute_hand');
    minuteHand.setAttribute('transform', `rotate(${angleOfMinute})`);

    // 时针转动
    let hourHand = document.querySelector('#hour_hand');
    hourHand.setAttribute('transform', `rotate(${angleOfHour})`);



    requestAnimationFrame(changePerSecond);

}

// 两次调用防止刷新
// setInterval(changePerSecond, 1000);
changePerSecond();