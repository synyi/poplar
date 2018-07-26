import {Sliceable} from "./Sliceable";

export interface SliceableText extends Sliceable {
    toString(): string

    slice(startIndex: number, endIndex: number): string
}