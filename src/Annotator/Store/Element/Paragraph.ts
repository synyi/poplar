import {TextSlice} from "../Base/TextSlice";
import {Sentence} from "./Sentence";
import {Store} from "../Store";
import {Label} from "./Label/Label";

/**
 * 段
 * 指用\n分隔的段
 */
export class Paragraph extends TextSlice {
    children: Array<Sentence> /*=[]; in base*/;
    parent: Store/*=null; in base*/;

    constructor(parent: Store,
                startIndexInParent: number,
                endIndexInParent: number) {
        super(parent, startIndexInParent, endIndexInParent);
        this.children = this.makeSentences();
    }

    labelAdded(label: Label, emitEvent: boolean): boolean {
        let startInSentenceIdx = this.children.findIndex((sentence: Sentence) => {
            return sentence.globalStartIndex <= label.startIndex &&
                label.startIndex < sentence.globalEndIndex;
        });
        let endInSentenceIdx = this.children.findIndex((sentence: Sentence) => {
            return sentence.globalStartIndex < label.endIndex &&
                label.endIndex <= sentence.globalEndIndex;
        });
        if (startInSentenceIdx !== endInSentenceIdx) {
            let removedSentences = this.children.slice(startInSentenceIdx + 1, endInSentenceIdx + 1);
            this.children[startInSentenceIdx].swallowArray(removedSentences);
            if (emitEvent)
                this.children[startInSentenceIdx].emit('textChanged');
            return false;
        }
        return true;
    }

    private makeSentences(): Array<Sentence> {
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