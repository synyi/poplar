import {Sliceable} from "./Sliceable";

/**
 * 可切分的文本块
 * String-like
 */
export interface SliceableText extends Sliceable {
    toString(): string

    slice(startIndex: number, endIndex: number): string
}