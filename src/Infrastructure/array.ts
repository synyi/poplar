import {none, Option, some} from "./option";

export function lookup<T>(array: Array<T>, index: number): Option<T> {
    if (array.length <= index) {
        return none;
    } else {
        return some(array[index]);
    }
}

export function takeWhile<T>(array: Array<T>, pred: (value: T) => boolean): Array<T> {
    const result = [];
    for (let i = 0; i < array.length && pred(array[i]); ++i) {
        result.push(array[i]);
    }
    return result;
}
