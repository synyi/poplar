import {Store} from "./Store";
import {Sentence} from "./Sentence";
import {LabelAttachedTextSlice} from "./Base/LabelAttachedTextSlice";
import {Label} from "./Label";

export class Paragraph extends LabelAttachedTextSlice {
    children: Array<Sentence>;

    constructor(public parent: Store,
                public startIndexInParent: number,
                public endIndexInParent: number) {
        super(parent, startIndexInParent, endIndexInParent);
        this.children = this.divideSentences();
    }

    labelAdded(label: Label) {
        let startInSentenceIdx = this.children.findIndex((sentence: Sentence) => {
            return sentence.globalStartIndex <= label.globalStartIndex &&
                label.globalStartIndex < sentence.globalEndIndex;
        });
        let endInSentenceIdx = this.children.findIndex((sentence: Sentence) => {
            return sentence.globalStartIndex < label.globalEndIndex &&
                label.globalEndIndex <= sentence.globalEndIndex;
        });
        if (startInSentenceIdx !== endInSentenceIdx) {
            let removedSentences = this.children.slice(startInSentenceIdx + 1, endInSentenceIdx + 1);
            this.children[startInSentenceIdx].swallowArray(removedSentences);
            this.children.splice(startInSentenceIdx + 1, endInSentenceIdx - startInSentenceIdx)
        } else {
            this.children[startInSentenceIdx].labelAdded(label);
        }
    }

    private divideSentences(): Array<Sentence> {
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
            if (nextStartIndex === nextEndIndex) {
                throw RangeError("nextStartIndex should never equals to nextEndIndex in divideSentences!");
            }
            nextStartIndex = nextEndIndex;
        }
        return result;
    }
}
