import {Paragraph} from "./Paragraph";

export class Sentence {
    constructor(private paragraphBelongTo: Paragraph,
                private startIndex: number,
                private endIndex: number) {
    }

    toString() {
        return this.paragraphBelongTo.slice(this.startIndex, this.endIndex);
    }

    slice(startIndex?: number, endIndex?: number): string {
        return this.paragraphBelongTo.slice(this.startIndex + startIndex, this.startIndex + endIndex)
    }

    length() {
        return this.endIndex - this.startIndex;
    }
}
