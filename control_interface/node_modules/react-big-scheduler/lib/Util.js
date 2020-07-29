'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
function getPos(element) {
    var x = 0,
        y = 0;
    do {
        x += element.offsetLeft - element.scrollLeft;
        y += element.offsetTop - element.scrollTop;
    } while (element = element.offsetParent);
    return { 'x': x, 'y': y };
}

exports.getPos = getPos;