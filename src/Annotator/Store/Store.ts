import {Paragraph} from "./Paragraph";
import {Label} from "./Label";
import {DataSource} from "./DataSource";
import {Dispatcher} from "../Dispatcher/Dispatcher";
import {AddLabelAction} from "../Action/AddLabel";
import {ResourceHolder} from "./Base/ResourceHolder";
import {LabelAdded} from "./Event/LabelAdded";

export class Store extends ResourceHolder {
    children: Array<Paragraph>;

    constructor(public dataSource: DataSource) {
        super(dataSource.getRawContent());
        this.children = this.makeParagraphs();
        this.dataSource.getLabels().sort(Label.compare).map(it => this.labelAdded(it));
        this.connections = dataSource.getConnections();
        Dispatcher.register("AddLabelAction", (action: AddLabelAction) => this.addLabelActionHandler(action));
    }

    addLabelActionHandler(action: AddLabelAction) {
        this.dataSource.requireText()
            .then((result) => {
                let theLabel = new Label(result, action.startIndex, action.endIndex);
                let addedEvent = this.labelAdded(theLabel);
                if (addedEvent !== null) {
                    this.dataSource.addLabel(theLabel);
                    addedEvent.emit();
                }
            });
    }

    labelAdded(label: Label): LabelAdded {
        let event = new LabelAdded(label);
        this.insertLabelIntoArray(label);
        let startInParagraphIdx = this.children.findIndex((paragraph: Paragraph) => {
            return paragraph.globalStartIndex <= label.globalStartIndex &&
                label.globalStartIndex < paragraph.globalEndIndex;
        });
        let endInParagraphIdx = this.children.findIndex((paragraph: Paragraph) => {
            return paragraph.globalStartIndex < label.globalEndIndex &&
                label.globalEndIndex <= paragraph.globalEndIndex;
        });
        if (startInParagraphIdx === -1 || endInParagraphIdx === -1)
            return null;
        if (startInParagraphIdx !== endInParagraphIdx) {
            let removedParagraphs = this.children.splice(startInParagraphIdx + 1, endInParagraphIdx - startInParagraphIdx);
            this.children[startInParagraphIdx].swallowArray(removedParagraphs);
            event.removedParagraphs = removedParagraphs;
        }
        event.paragraphIn = this.children[startInParagraphIdx];
        let mergeSentenceInfo = this.children[startInParagraphIdx].labelAdded(label);
        if (mergeSentenceInfo) {
            event.removedSentences = mergeSentenceInfo.removedSentences;
            event.sentenceIn = mergeSentenceInfo.sentenceIn;
        }
        return event;
    }

    private insertLabelIntoArray(label: Label) {
        let indexToInsertIn: number;
        for (indexToInsertIn = 0; indexToInsertIn < this.labels.length; ++indexToInsertIn) {
            let theLabelCompareWith = this.labels[indexToInsertIn];
            if (Label.compare(label, theLabelCompareWith) < 0) {
                break;
            }
        }
        this.labels.splice(indexToInsertIn, 0, label);
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
