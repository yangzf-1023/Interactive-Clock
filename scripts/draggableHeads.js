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

    // 状态机的初态
    let lastNeedleState = {lastSecond: 0xfefefefe, lastMinute: 0xfefefefe, lastHour: 0xfefefefe};

    function startDrag(event) {
        /* 禁用时不响应鼠标事件 */
        if (!isClockPaused) {
            svg.removeEventListener('mousemove', drag);
            svg.removeEventListener('mouseup', endDrag);
            svg.removeEventListener('mouseleave', endDrag);
            return;
        }

        selectedElement = event.target;
        if (selectedElement.id.indexOf("second_") === -1) {
            /* 不是秒针 */
            selectedElement.style.transitionDuration = '0s';
        } else {
            /* 是秒针，需要一次性改多个元素 */
            secondHand.style.transitionDuration = '0s';
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

        // 开始转动时的角度 

        // 秒针的旋转角度
        lastNeedleState.lastSecond = Number(getComputedStyle(secondHand).getPropertyValue('--degree').slice(0, -3));
        // 分针的旋转角度
        lastNeedleState.lastMinute = Number(getComputedStyle(minuteHand).getPropertyValue('--degree').slice(0, -3));
        // 时针的旋转角度
        lastNeedleState.lastHour = Number(getComputedStyle(hourHand).getPropertyValue('--degree').slice(0, -3));
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
            // 下面该设置时间了,暂且约定动某一个针不影响其他的
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
                if(whichState === 'lastSecond'){
                    currentState = angleOfSecond;
                }
                else if(whichState === 'lastMinute'){
                    currentState = angleOfMinute;
                }
                else{
                    currentState = angleOfHour;
                }

                // 非初态
                if (lastState !== 0xfefefefe) {
                    /* 这里的尺度不能太大 */
                    let delta = currentState - lastState;

                    // 正向绕过一圈
                    if (currentState <= 15 && lastState >= 345) {
                        delta += 360;
                    } 
                    // 逆向绕过一圈
                    else if (currentState >= 345 && lastState <= 15) {
                        delta -= 360;
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

                    while(angleOfHour < 0){
                        angleOfHour += 360;
                    }
                    while(angleOfHour > 360){
                        angleOfHour -=360;
                    }
                    while(angleOfMinute < 0){
                        angleOfMinute += 360;
                    }
                    while(angleOfMinute > 360){
                        angleOfMinute -=360;
                    }
                    while(angleOfSecond < 0){
                        angleOfSecond += 360;
                    }
                    while(angleOfSecond > 360){
                        angleOfSecond -=360;
                    }

                    minuteHand.style.setProperty('--degree', `${angleOfMinute}deg`);
                    hourHand.style.setProperty('--degree', `${angleOfHour}deg`);

                    lastStateObj[whichState] += delta;
                    while (lastStateObj[whichState] > 360) {
                        lastStateObj[whichState] -= 360;
                    }
                    while (lastStateObj[whichState] < 0) {
                        lastStateObj[whichState] += 360;
                    }
                } else {
                    lastStateObj[whichState] = currentState;
                }
            };

            // 秒针-分针联动

            // 动的是秒针
            if (selectedElement.id.indexOf("second_") !== -1) {
                joint(lastNeedleState, "lastSecond");
            } 
            else if (selectedElement.id.indexOf("minute_") !== -1) {
                joint(lastNeedleState, "lastMinute");
            }

            // 使用round更符合视觉直观，使用floor是为了保证逻辑时间的正确
            // 使用%60是为了保证不超过60
            second = Math.floor(60 * angleOfSecond / 360) % 60;
            secondPlace.value = String(second).padStart(2, '0');
            minute = Math.floor(60 * angleOfMinute / 360) % 60;
            minutePlace.value = String(minute).padStart(2, '0');
            // 这里涉及24小时制和12小时制的问题
            hour = Math.floor(12 * angleOfHour / 360) % 24;
            hourPlace.value = String(hour).padStart(2, '0');
        }
    }

    // 之前的逻辑是依据时间设置角度
    // 现在如何放过来依据角度设置时间？
    // 更新到setTime

    function endDrag() {
        // 每松开一次
        svg.removeEventListener('mousemove', drag);
        svg.removeEventListener('mouseup', endDrag);
        svg.removeEventListener('mouseleave', endDrag);
        selectedElement.style.transitionDuration = '0.5s';
        secondHand.style.transitionDuration = "0.5s";
        selectedElement = null;
    }
});
