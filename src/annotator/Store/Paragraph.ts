import {Sentence} from "./Sentence";
import {Store} from "./Store";
import {AnnotableStringSlice} from "./Base/AnnotableStringSlice";
import {EventBus} from "../../library/EventBus";

export class Paragraph extends AnnotableStringSlice {
    public sentences: Array<Sentence> = [];

    constructor(private store: Store,
                public startIndexInParent: number,
                public endIndexInParent: number) {
        super(store, startIndexInParent, endIndexInParent);
        let rawParagraph = this.toString();
        let rawSentences = rawParagraph.split(/[！。？]/g);
        while (rawSentences[rawSentences.length - 1] === '') {
            rawSentences.pop();
        }
        let nextRawSentencesIdxInArray = 0;
        let startIndex = 0;
        let endIndex: number;
        while (nextRawSentencesIdxInArray < rawSentences.length) {
            let rawSentence = rawSentences[nextRawSentencesIdxInArray];
            ++nextRawSentencesIdxInArray;
            endIndex = startIndex + rawSentence.length;
            if (endIndex < rawParagraph.length) {
                ++endIndex;
            }
            for (let label of this.store.labels) {
                if (this.toLocalIndex(label.startIndexInRawContent) < endIndex && endIndex <= this.toLocalIndex(label.endIndexInRawContent)) {
                    rawSentence = rawSentences[nextRawSentencesIdxInArray];
                    ++nextRawSentencesIdxInArray;
                    endIndex += rawSentence.length;
                    if (endIndex < rawParagraph.length) {
                        ++endIndex;
                    }
                }
            }
            if (this.slice(startIndex, endIndex).trim())
                this.sentences.push(new Sentence(this, startIndex, endIndex));
            startIndex = endIndex;
        }
    }

    makeSureIndexesInSameSentence(startIndexInRawContent: number, endIndexInRawContent: number) {
        let [startSentenceIndex, startSentence] = this.getSentenceForIndex(this.toLocalIndex(startIndexInRawContent));
        let [endSentenceIndex, endSentence] = this.getSentenceForIndex(this.toLocalIndex(endIndexInRawContent - 1));
        if (startSentence !== endSentence) {
            let newSentence = new Sentence(this, startSentence.startIndexInParent, endSentence.endIndexInParent);
            this.sentences.splice(startSentenceIndex, endSentenceIndex - startSentenceIndex + 1, newSentence);
            EventBus.emit('merge_sentence', {
                startIndex: startSentenceIndex,
                endIndex: endSentenceIndex,
                mergedInto: newSentence
            });
        }
    }

    getSentenceForIndex(index: number): [number, Sentence] {
        for (let i in this.sentences) {
            let sentence = this.sentences[i];
            if (sentence.startIndexInParent <= index && index < sentence.endIndexInParent) {
                return [i as any as number, sentence];
            }
        }
    }
}
