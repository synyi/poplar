import {Sentence} from "./Sentence";

export class Label {
    constructor(private text: string,
                public sentenceBelongTo: Sentence,
                public startIndexInSentence: number,
                public endIndexInSentence: number) {
        sentenceBelongTo.labels.push(this);
    }

    toString(): string {
        return this.text
    }

    annotatedText(): string {
        return this.sentenceBelongTo.slice(this.startIndexInSentence, this.endIndexInSentence)
    }
}
