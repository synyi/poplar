import {TextSlice} from "./Base/TextSlice";
import {Store} from "./Store";
import {Sentence} from "./Sentence";
import {Label} from "./Label";

export class Paragraph extends TextSlice {
    sentences: Array<Sentence> = [];

    constructor(private storeBelongTo: Store,
                public startIndexInParent: number,
                public endIndexInParent: number) {
        super(storeBelongTo, startIndexInParent, endIndexInParent);
        this.sentences = this.makeSentences();
    }

    makeSentences(): Array<Sentence> {
        let result = [];
        let rawParagraph = this.toString();
        let nextStartIndex = 0;
        while (nextStartIndex < rawParagraph.length) {
            while (rawParagraph[nextStartIndex] === ' ' || rawParagraph[nextStartIndex] === '\n') {
                ++nextStartIndex;
            }
            let nextEndIndex = nextStartIndex;
            while (!(/[！。？ \n]/.test(rawParagraph[nextEndIndex])) && nextEndIndex < rawParagraph.length) {
                ++nextEndIndex;
            }
            while (/[！。？ \n]/.test(rawParagraph[nextEndIndex]) && nextEndIndex < rawParagraph.length) {
                ++nextEndIndex;
            }
            --nextEndIndex;
            while (rawParagraph[nextEndIndex] === ' ' || rawParagraph[nextEndIndex] === '\n') {
                --nextEndIndex;
            }
            ++nextEndIndex;
            result.push(new Sentence(this, nextStartIndex, nextEndIndex));
            nextStartIndex = nextEndIndex;
        }
        return result;
    }

    makeSureLabelInOneSentence(label: Label) {
        let mergedInfo: any = {};
        let startInSentenceIdx = this.sentences.findIndex((sentence: Sentence) => {
            return sentence.startIndexInParent + this.startIndexInParent <= label.startIndexInRawContent &&
                label.startIndexInRawContent < sentence.endIndexInParent + this.startIndexInParent;
        });
        let endInSentenceIdx = this.sentences.findIndex((sentence: Sentence) => {
            return sentence.startIndexInParent + this.startIndexInParent < label.endIndexInRawContent &&
                label.endIndexInRawContent <= sentence.endIndexInParent + this.startIndexInParent;
        });
        if (startInSentenceIdx !== endInSentenceIdx) {
            let mergedSentences = this.sentences.slice(startInSentenceIdx, endInSentenceIdx + 1);
            let mergedIntoSentence = new Sentence(this, this.sentences[startInSentenceIdx].startIndexInParent, this.sentences[endInSentenceIdx].endIndexInParent);
            this.sentences.splice(startInSentenceIdx, endInSentenceIdx - startInSentenceIdx + 1, mergedIntoSentence);
            mergedInfo.mergedSentences = mergedSentences;
            mergedInfo.mergedIntoSentence = mergedIntoSentence;
        }
        return mergedInfo;
    }
}
