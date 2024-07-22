

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

    function startDrag(event) {

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
                /* 是秒针，需要一次性改多个元素 */
                secondHand.style.setProperty('--degree', `${angle}deg`);
            }
            // 下面该设置时间了,暂且约定动某一个针不影响其他的
            let second = secondPlace.value;
            let minute = minutePlace.value;
            let hour = hourPlace.value;

            // 如果选中的是秒针
            if (selectedElement.id.indexOf("second_") !== -1) {
                let angleOfSecond = Number(getComputedStyle(selectedElement).getPropertyValue('--degree').slice(0, -3));
                // 使用round更符合视觉直观
                // 使用%60是为了保证不超过60
                second = Math.round(60 * angleOfSecond / 360) % 60;
                secondPlace.value =  String(second).padStart(2, '0');
            }
            else if (selectedElement.id === 'minute_hand') {
                let angleOfMinute = Number(getComputedStyle(selectedElement).getPropertyValue('--degree').slice(0, -3));
                minute = Math.round(60 * angleOfMinute / 360) % 60;
                minutePlace.value = String(minute).padStart(2, '0');
            }
            else {
                let angleOfHour = Number(getComputedStyle(selectedElement).getPropertyValue('--degree').slice(0, -3));
                hour = Math.round(12 * angleOfHour / 360);
                hourPlace.value = String(hour).padStart(2, '0');
            }
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
