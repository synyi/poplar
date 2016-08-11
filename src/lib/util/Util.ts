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
}