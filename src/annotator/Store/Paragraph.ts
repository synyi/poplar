import {Sentence} from "./Sentence";
import {Store} from "./Store";

export class Paragraph {
    public sentences: Array<Sentence> = [];

    constructor(private store: Store, public startIndex: number, public endIndex: number) {
        let rawParagraph = store.slice(startIndex, endIndex);
        let rawSentences = rawParagraph.split(/[！。？]/g);
        if (rawSentences[rawSentences.length - 1] === '') {
            rawSentences.pop();
        }
        let sentenceStartIndex = 0;
        let sentenceEndIndex: number;
        for (let rawSentence of rawSentences) {
            sentenceEndIndex = sentenceStartIndex + rawSentence.length + 1;
            if (this.store.slice(sentenceStartIndex, sentenceEndIndex).trim())
                this.sentences.push(new Sentence(this, sentenceStartIndex, sentenceEndIndex, store.getLabelsInRange(sentenceStartIndex + startIndex, sentenceEndIndex + endIndex)));
            sentenceStartIndex = sentenceEndIndex;
        }
    }

    toString(): string {
        return this.store.slice(this.startIndex, this.endIndex);
    }

    slice(startIndex?: number, endIndex?: number): string {
        return this.store.slice(this.startIndex + startIndex, this.startIndex + endIndex);
    }
}
