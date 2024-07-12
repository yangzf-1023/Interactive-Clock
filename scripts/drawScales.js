// 刻度
const oneHour = document.querySelector('.hour_scale');
// 文档碎片
const newScales = document.createDocumentFragment();
// SVG图像
const svg = document.querySelector('svg');

for(let i = 6; i < 360; i += 6){
    // 必须引用命名空间！否则浏览器会当普通标签处理！
    let scale = document.createElementNS("http://www.w3.org/2000/svg","path");
    scale.setAttribute('class', 'second_scale');
    scale.setAttribute('d', 'M 265 10 L 265 30 L 255 30 L 255 10 L 265 10 Z');
    scale.setAttribute('fill', 'black');
    scale.setAttribute('transform', `rotate(${i}, 260, 260)`);
    newScales.append(scale);
}
for(let i = 30; i < 360; i += 30){
    let scale = document.createElementNS("http://www.w3.org/2000/svg","path");
    scale.setAttribute('class', 'hour_scale');
    scale.setAttribute('d', 'M 270 10 L 270 50 L 250 50 L 250 10 L 270 10 Z');
    scale.setAttribute('fill', 'black');
    scale.setAttribute('transform', `rotate(${i}, 260, 260)`);
    newScales.append(scale);
}
// 这样整个文档只插入了一次
svg.insertBefore(newScales, oneHour);