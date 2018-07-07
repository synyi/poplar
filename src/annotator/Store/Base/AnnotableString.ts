import {LabelContainer} from "./LabelContainer";

export interface AnnotableString extends LabelContainer {
    slice(startIndex: number, endIndex: number): string

    toString(): string

    length(): number
}