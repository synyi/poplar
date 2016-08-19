'use strict';
export class Util {
    static height(node) {
        return node.clientHeight || node.getBoundingClientRect().height;
    }
    static width(node) {
        return node.clientWidth || node.getBoundingClientRect().width;
    }
    static top(node) {
        return node.clientTop || node.getBoundingClientRect().top;
    }
    static left(node) {
        return node.clientLeft || node.getBoundingClientRect().left;
    }

    static autoIncrementId(lines, key) {
        let max = -1;
        for (let line of lines) {
            for (let item of line) {
                if (item[key] > max)
                    max = item[key];
            }
        }
        return max + 1;
    }

    static removeInLines(lines, callback) {
        for (let line of lines) {
            for (let i=0; i < line.length; i++) {
                if (callback(line[i])) {
                    line.splice(i, 1);
                    return true;
                }
            }
        }
        return false;
    }
}