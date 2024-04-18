export const pxToDot = function (num: number) {
    return num / 96 * 72;
}

export const dotToPx = function (num: number) {
    return 96 / 72 * num;
}

export const getAbsoluteOffset = function (currentElem: HTMLElement | null) {
    var offsetX = 0;
    var offsetY = 0;
    while (currentElem) {
        offsetX += currentElem.offsetLeft;
        offsetY += currentElem.offsetTop;
        currentElem = currentElem.parentElement;
    }
    return { offsetX, offsetY };
}