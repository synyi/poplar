import {Sentence} from "./Sentence";

export class Label {
    constructor(private text: string,
                public sentenceBelongTo: Sentence,
                public startIndex: number,
                public endIndex: number) {
    }

    toString(): string {
        return this.text
    }

    annotatedText(): string {
        return this.sentenceBelongTo.slice(this.startIndex, this.endIndex)
    }
}
