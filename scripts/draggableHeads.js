let regex = new RegExp(':[0-5][0-9]$');

document.addEventListener('DOMContentLoaded', () => {
    const svg = document.querySelector('svg');
    const centerGetter = document.querySelector('#centerGetter');

    let minuteHand = document.querySelector('#minute_hand');
    let hourHand = document.querySelector('#hour_hand');
    const secondHand = document.querySelector('#second_handle');
    const hands = [minuteHand, hourHand, secondHand];

    hands.forEach(hand => {
        hand.addEventListener('mousedown', startDrag);
    });

    let selectedElement = null;
    let centerX, centerY;

    // 24小时则为true
    let flagOfTimeMode = false;

    // 状态机的初态
    let lastNeedleState = { lastSecond: 0xfefefefe, lastMinute: 0xfefefefe, lastHour: 0xfefefefe };

    // 时针的状态，24-12小时制的转换
    let lastHourValue = hourPlace.value;

    function startDrag(event) {
        /* 禁用时不响应鼠标事件 */
        if (!isClockPaused) {
            svg.removeEventListener('mousemove', drag);
            svg.removeEventListener('mouseup', endDrag);
            svg.removeEventListener('mouseleave', endDrag);
            return;
        }

        selectedElement = event.target;

        for (const hand of hands) {
            hand.style.transitionDuration = '0s';
        }

        centerX = centerGetter.getBoundingClientRect().x;
        centerY = centerGetter.getBoundingClientRect().y;

        svg.addEventListener('mousemove', drag);
        svg.addEventListener('mouseup', endDrag);
        svg.addEventListener('mouseleave', endDrag);
        // 清除之前的轮数
        sessionStorage.removeItem('turnsOfHour');
        sessionStorage.removeItem('turnsOfSecond');
        sessionStorage.removeItem('turnsOfHour');

        // 秒针的旋转角度
        lastNeedleState.lastSecond = Number(getComputedStyle(secondHand).getPropertyValue('--degree').slice(0, -3));
        // 分针的旋转角度
        lastNeedleState.lastMinute = Number(getComputedStyle(minuteHand).getPropertyValue('--degree').slice(0, -3));
        // 时针的旋转角度
        lastNeedleState.lastHour = Number(getComputedStyle(hourHand).getPropertyValue('--degree').slice(0, -3));

        // 上一个时
        lastHourValue = hourPlace.value;
        // 上一个分
        lastMinuteValue = minutePlace.value;
        // 上一个秒
        lastSecondValue = secondPlace.value;

        console.log(lastHourValue, lastMinuteValue, lastSecondValue);

        if (lastHourValue >= 12) {
            flagOfTimeMode = true;
        }
        else {
            flagOfTimeMode = false;
        }
        console.log(flagOfTimeMode);
    }

    function drag(event) {
        if (selectedElement) {
            const mouseX = event.clientX;
            const mouseY = event.clientY;

            const dx = mouseX - centerX;
            const dy = mouseY - centerY;
            // angle是当前指针所在的角度
            let angle = Math.atan2(dy, dx) * (180 / Math.PI) + 90;

            // 之前的角度有问题
            if (angle <= 0) {
                angle += 360;
            }
            // console.log(dx, dy, angle);

            if (selectedElement.id.indexOf("second_") === -1) {
                /* 不是秒针 */
                selectedElement.style.setProperty('--degree', `${angle}deg`);
            } else {
                /* 是秒针，需要一次性改多个元素，selectedElement可能只是一个小组件，没有资格代表整个秒针 */
                secondHand.style.setProperty('--degree', `${angle}deg`);
            }
            // 下面该设置时间了
            let second = secondPlace.value;
            let minute = minutePlace.value;
            let hour = hourPlace.value;

            let angleOfSecond = Number(getComputedStyle(secondHand).getPropertyValue('--degree').slice(0, -3));
            let angleOfMinute = Number(getComputedStyle(minuteHand).getPropertyValue('--degree').slice(0, -3));
            let angleOfHour = Number(getComputedStyle(hourHand).getPropertyValue('--degree').slice(0, -3));

            // 下面要看懂这个函数
            let joint = (lastStateObj, whichState) => {
                // 上一秒或者上一分钟或上一个小时是多少
                let lastState = lastStateObj[whichState];
                // 当前时钟是多少
                if (whichState === 'lastSecond') {
                    currentState = angleOfSecond;
                }
                else if (whichState === 'lastMinute') {
                    currentState = angleOfMinute;
                }
                else {
                    currentState = angleOfHour;
                }

                // 非初态
                if (lastState !== 0xfefefefe) {
                    /* 这里的尺度不能太大 */
                    let delta = currentState - lastState;

                    console.log(currentState, lastState, lastHourValue, lastMinuteValue);
                    
                    // 正向绕过一圈(这里的判定仍需要修改)
                    if (currentState <= 90 && lastState >= 270) {
                        console.log('test');

                        if ((lastHourValue == 11 && whichState === 'lastHour')
                            // || (lastHourValue == 11 && lastMinuteValue == 59 && whichState === 'lastMinute')
                            || (lastHourValue == 11 && whichState === 'lastMinute')
                            || (lastHourValue == 11 && lastMinuteValue == 59 && whichState === 'lastSecond')) {
                            flagOfTimeMode = true;
                            console.log('test', flagOfTimeMode);
                        }
                        else if ((lastHourValue == 23 && whichState === 'lastHour')
                            || (lastHourValue == 23 && whichState === 'lastMinute')
                            || (lastHourValue == 23 && lastMinuteValue == 59 && whichState === 'lastSecond')) {
                            flagOfTimeMode = false;
                            console.log('test', flagOfTimeMode);
                        }
                        delta += 360;
                    }
                    // 逆向绕过一圈
                    else if (currentState >= 270 && lastState <= 90) {
                        if ((lastHourValue == 12 && whichState === 'lastHour')
                            || (lastHourValue == 12 && whichState === 'lastMinute')
                            || (lastHourValue == 12 && lastMinuteValue == 0 && whichState === 'lastSecond')) {
                            flagOfTimeMode = false;
                        }
                        else if ((lastHourValue == 0 && whichState === 'lastHour')
                            || (lastHourValue == 0 && whichState === 'lastMinute')
                            || (lastHourValue == 0 && lastMinuteValue == 0 && whichState === 'lastSecond')) {
                            flagOfTimeMode = true;
                        }
                        delta -= 360;
                    }
                    // 更新数据
                    lastStateObj[whichState] += delta;


                    while (lastStateObj[whichState] > 360) {
                        lastStateObj[whichState] -= 360;
                    }
                    while (lastStateObj[whichState] < 0) {
                        lastStateObj[whichState] += 360;
                    }

                    if (whichState === "lastSecond") {
                        /* 更新分针 */
                        angleOfMinute += delta / 60;
                        // 更新时针
                        angleOfHour += delta / 720;
                    }
                    else if (whichState === "lastMinute") {
                        /* 更新时针 */
                        angleOfHour += delta / 12;
                    }


                    while (angleOfHour < 0) {
                        angleOfHour += 360;
                    }
                    while (angleOfHour > 360) {
                        angleOfHour -= 360;
                    }
                    while (angleOfMinute < 0) {
                        angleOfMinute += 360;
                    }
                    while (angleOfMinute > 360) {
                        angleOfMinute -= 360;
                    }
                    while (angleOfSecond < 0) {
                        angleOfSecond += 360;
                    }
                    while (angleOfSecond > 360) {
                        angleOfSecond -= 360;
                    }

                    minuteHand.style.setProperty('--degree', `${angleOfMinute}deg`);
                    hourHand.style.setProperty('--degree', `${angleOfHour}deg`);

                }
                else {
                    lastStateObj[whichState] = currentState;
                }
                // 更新旧有的值
                lastHourValue = hourPlace.value;
                lastMinuteValue = minutePlace.value;
                lastSecondValue = secondPlace.value;
                console.log(flagOfTimeMode);
            };

            // 秒针-分针-时针联动

            // 动的是秒针
            if (selectedElement.id.indexOf("second_") !== -1) {
                joint(lastNeedleState, "lastSecond");
            }
            else if (selectedElement.id.indexOf("minute_") !== -1) {
                joint(lastNeedleState, "lastMinute");
            }
            else {
                joint(lastNeedleState, "lastHour");
            }

            // 使用round更符合视觉直观，使用floor是为了保证逻辑时间的正确
            // 使用%60是为了保证不超过60
            second = Math.floor(60 * angleOfSecond / 360) % 60;
            secondPlace.value = String(second).padStart(2, '0');
            minute = Math.floor(60 * angleOfMinute / 360) % 60;
            minutePlace.value = String(minute).padStart(2, '0');
            // 这里涉及24小时制和12小时制的问题
            hour = Math.floor(12 * angleOfHour / 360) % 12;
            if (flagOfTimeMode) {
                hour += 12;
            }
            hourPlace.value = String(hour).padStart(2, '0');
        }
    }

    function endDrag() {
        // console.log('last', lastNeedleState.lastHour);
        if (lastNeedleState.lastHour >= 12) {
            flagOfTimeMode = true;
        }
        else {
            flagOfTimeMode = false;
        }
        console.log(flagOfTimeMode);
        // 每松开一次

        //更新时间
        let setHour = hourPlace.value;
        let setMinute = minutePlace.value;
        let setSecond = secondPlace.value;

        let angleOfSecond = 6 * Number(setSecond);
        let angleOfMinute = 6 * (Number(setMinute) + Number(setSecond) / 60);
        let angleOfHour = 30 * (Number(setHour) % 12 + (Number(setMinute) + Number(setSecond) / 60) / 60);


        for (const item of secondHands) {
            item.style.setProperty('--degree', `${angleOfSecond}deg`);
        }
        minuteHand.style.setProperty('--degree', `${angleOfMinute}deg`);
        hourHand.style.setProperty('--degree', `${angleOfHour}deg`);

        svg.removeEventListener('mousemove', drag);
        svg.removeEventListener('mouseup', endDrag);
        svg.removeEventListener('mouseleave', endDrag);
        selectedElement.style.transitionDuration = '0.5s';
        secondHand.style.transitionDuration = "0.5s";
        selectedElement = null;
    }
});

