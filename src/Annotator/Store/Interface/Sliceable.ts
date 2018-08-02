/**
 * 可切分的块
 */
export interface Sliceable {
    slice(startIndex: number, endIndex: number)

    length: number
}