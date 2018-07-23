import {Sliceable} from "./Base/Sliceable";
import {Paragraph} from "./Paragraph";
import {Label} from "./Label";
import {LabelHolder} from "./Base/LabelHolder";
import {DataSource} from "./DataSource";
import {Dispatcher} from "../Dispatcher/Dispatcher";
import {AddLabelAction} from "../Action/AddLabel";
import {EventBus} from "../Tools/EventBus";

export class Store implements LabelHolder, Sliceable {
    public paragraphs: Array<Paragraph> = [];
    labels: Array<Label> = [];
    public readonly data: string;

    constructor(public dataSource: DataSource) {
        this.data = this.dataSource.getRawContent();
        this.paragraphs = this.makeParagraphs();
        this.dataSource.getLabels().map(it => this.addLabel(it));
        Dispatcher.register("AddLabelAction", (action: AddLabelAction) => {
            this.dataSource.requireText().then((result) => {
                let theLabel = new Label(result, action.startIndex, action.endIndex);
                let mergeInfo = this.addLabel(theLabel);
                let labelInInfo = null;
                EventBus.emit("label_added", {
                    labelAdded: theLabel,
                    labelInInfo: labelInInfo,
                    mergeInfo: mergeInfo
                });
            });
        });
    }

    addLabel(label: Label) {
        let mergedInfo: any = {};
        this.dataSource.addLabel(label);
        let indexToInsertIn: number;
        for (indexToInsertIn = 0; indexToInsertIn < this.labels.length; ++indexToInsertIn) {
            let theLabelCompareWith = this.labels[indexToInsertIn];
            if (label.startIndexInRawContent < theLabelCompareWith.startIndexInRawContent ||
                (label.startIndexInRawContent === theLabelCompareWith.startIndexInRawContent &&
                    label.endIndexInRawContent < theLabelCompareWith.endIndexInRawContent)) {
                break;
            }
        }
        this.labels.splice(indexToInsertIn, 0, label);
        let startInParagraphIdx = this.paragraphs.findIndex((paragraph: Paragraph) => {
            return paragraph.startIndexInParent <= label.startIndexInRawContent && label.startIndexInRawContent < paragraph.endIndexInParent;
        });
        let endInParagraphIdx = this.paragraphs.findIndex((paragraph: Paragraph) => {
            return paragraph.startIndexInParent < label.endIndexInRawContent && label.endIndexInRawContent <= paragraph.endIndexInParent;
        });
        if (startInParagraphIdx !== endInParagraphIdx) {
            let mergedParagraphs = this.paragraphs.slice(startInParagraphIdx, endInParagraphIdx + 1);
            let mergedIntoParagraph =
                new Paragraph(this, this.paragraphs[startInParagraphIdx].startIndexInParent, this.paragraphs[endInParagraphIdx].endIndexInParent);
            this.paragraphs.splice(startInParagraphIdx, endInParagraphIdx - startInParagraphIdx + 1, mergedIntoParagraph);
            mergedInfo.mergedParagraphs = mergedParagraphs;
            mergedInfo.mergedIntoParagraph = mergedIntoParagraph;
        }
        let mergeSentenceInfo = this.paragraphs[startInParagraphIdx].makeSureLabelInOneSentence(label);
        if (!mergedInfo.mergedIntoParagraph) {
            mergedInfo = mergeSentenceInfo;
        }
        return mergedInfo;
    }

    getFirstLabelCross(index: number): Label {
        for (let label of this.labels) {
            if (index > label.startIndexInRawContent && label.endIndexInRawContent > index) {
                return label;
            }
        }
        return null;
    }

    getLabelsInRange(startIndex: number, endIndex: number): Array<Label> {
        let result = [];
        let passedLabelBeforeRange = false;
        for (let label of this.labels) {
            if (startIndex <= label.startIndexInRawContent && label.endIndexInRawContent <= endIndex) {
                passedLabelBeforeRange = true;
                result.push(label);
            } else if (passedLabelBeforeRange) {
                break;
            }
        }
        return result;
    }

    get length(): number {
        return this.data.length;
    }

    toString(): string {
        return this.data;
    }

    slice(startIndex: number, endIndex: number): string {
        return this.data.slice(startIndex, endIndex);
    }

    private makeParagraphs(): Array<Paragraph> {
        let result = [];
        let splittedRawContent = this.data.split('\n').map(it => it.trim()).filter(it => it !== '');
        let nextParagraphStartIdx = 0;
        for (let rawParagraph of splittedRawContent) {
            while (this.data[nextParagraphStartIdx] === '\n' || this.data[nextParagraphStartIdx] === ' ' || this.data[nextParagraphStartIdx] === '\t') {
                ++nextParagraphStartIdx;
            }
            result.push(new Paragraph(this, nextParagraphStartIdx, nextParagraphStartIdx + rawParagraph.length));
            nextParagraphStartIdx += rawParagraph.length;
        }
        return result;
    }
}
