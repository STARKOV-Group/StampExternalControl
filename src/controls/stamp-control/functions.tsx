export const pxToDot = function(num: number) {
    return num / 96 * 72;
}

export const dotToPx = function(num: number) {
    return 96 / 72 * num;
}