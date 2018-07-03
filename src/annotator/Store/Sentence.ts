import {Paragraph} from "./Paragraph";
import {Label} from "./Label";

export class Sentence {
    public labels: Array<Label> = [];

    constructor(private paragraphBelongTo: Paragraph,
                private startIndex: number,
                private endIndex: number,
                rawLabels: Array<{
                    text: string,
                    startIndexInRawContent: number,
                    endIndexInRawContent: number
                }>) {
        for (let rawLabel of rawLabels) {
            this.labels.push(new Label(rawLabel.text, this,
                rawLabel.startIndexInRawContent - startIndex - paragraphBelongTo.startIndex,
                rawLabel.endIndexInRawContent - startIndex - paragraphBelongTo.startIndex
            ));
        }
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

    getLabelsInRange(startIndex: number, endIndex: number): Array<Label> {
        return this.labels.filter((label: Label) => {
            return startIndex <= label.startIndexInSentence && label.endIndexInSentence <= endIndex;
        })
    }
}
