/// <reference path="svgjs/svgjs.d.ts" />
let draw = (SVG as any)('drawing').size(2000, 2000);
let highlightGroup = draw.group();
let textGroup = draw.group();

let text = textGroup.text('猫是纯食肉动物，无肉不欢。人类的食物要慎重给猫，即便它看上去很想吃，或者吃的津津有味，比如干鱿鱼丝。巧克力中的可可碱对猫有毒性。');
window.addEventListener('mouseup', () => {
    let selection = window.getSelection();
    if (selection.anchorOffset == selection.focusOffset) {
        return;
    }
    let startAt = text.node.getExtentOfChar(selection.anchorOffset);
    let endAt = text.node.getExtentOfChar(selection.focusOffset - 1);
    console.log(startAt);
    console.log(endAt);
    let width = endAt.x - startAt.x + endAt.width;
    let height = endAt.height;
    let left = startAt.x;
    let top = startAt.y;
    highlightGroup.rect(width, height).move(left, top).attr({'fill':'red'});
});

window['svgText'] = text;
window['drawRect'] = (width, height, left, top) => { draw.rect(width, height).move(left, top); };

// console.log(text.length());