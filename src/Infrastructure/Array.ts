import {none, Option, some} from "./Option";

export function lookup<T>(array: Array<T>, index: number): Option<T> {
    if (array.length <= index) {
        return none;
    } else {
        return some(array[index]);
    }
}

export function takeWhile<T>(array: Array<T>, pred: (value: T) => boolean): Array<T> {
    let i: number;
    for (i = 0; i < array.length && pred(array[i]); ++i) {
    }
    return array.slice(0, i);
}
