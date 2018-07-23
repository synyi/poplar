export interface Sliceable {
    slice(startIndex: number, endIndex: number): string

    toString(): string

    length: number
}