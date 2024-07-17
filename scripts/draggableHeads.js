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
    }

    function drag(event) {
        if (selectedElement) {
            const mouseX = event.clientX;
            const mouseY = event.clientY;

            const dx = mouseX - centerX;
            const dy = mouseY - centerY;
            let angle = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
            console.log(dx, dy, angle);
            if (selectedElement === minuteHand) {
                angle += sessionStorage.getItem('turnsOfMinute') * 360;
            } else if (selectedElement === hourHand) {
                angle += sessionStorage.getItem('turnsOfHour') * 360;
            } else {
                angle += sessionStorage.getItem('turnsOfSecond') * 360;
            }
            if (selectedElement.id.indexOf("second_") === -1) {
                /* 不是秒针 */
                selectedElement.style.setProperty('--degree', `${angle}deg`);
            } else {
                /* 是秒针，需要一次性改多个元素 */
                secondHand.style.setProperty('--degree', `${angle}deg`);
            }
        }
    }

    function endDrag() {
        svg.removeEventListener('mousemove', drag);
        svg.removeEventListener('mouseup', endDrag);
        svg.removeEventListener('mouseleave', endDrag);
        selectedElement.style.transitionDuration = '0.5s';
        selectedElement = null;
    }
});
