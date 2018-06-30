import {Sentence} from "./Sentence";

export class Label {
    constructor(private text: string,
                private sentenceBelongTo: Sentence,
                private startIndex: number,
                private endIndex: number) {
    }

    toString(): string {
        return this.text
    }

    annotatedText(): string {
        return this.sentenceBelongTo.slice(this.startIndex, this.endIndex)
    }
}
