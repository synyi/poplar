import {Connection} from "./Connection";
import {AnnotatorDataSource} from "./AnnotatorDataSource";
import {Label} from "./Label";
import {Paragraph} from "./Paragraph";
import {EventBus} from "../../library/EventBus";
import {ResourceHolder} from "./Base/ResourceHolder";

export class Store extends ResourceHolder {
    paragraphs: Array<Paragraph> = [];

    constructor(public dataSource: AnnotatorDataSource) {
        super();
        this.data = this.dataSource.getRawContent();
        this.labels = this.dataSource.getLabels();
        this.parseRawContent();
    }

    addLabel(text: string,
             startIndexInRawContent: number,
             endIndexInRawContent: number) {
        let theLabel = new Label(text, startIndexInRawContent, endIndexInRawContent);
        let [firstParagraphIndex, firstParagraph] = this.getParagraphForIndex(startIndexInRawContent);
        let [lastParagraphIndex, lastParagraph] = this.getParagraphForIndex(endIndexInRawContent - 1);
        let theParagraphToAddLabelInto = firstParagraph;
        if (firstParagraph !== lastParagraph) {
            let newParagraph = new Paragraph(this, firstParagraph.startIndexInParent, lastParagraph.endIndexInParent);
            this.paragraphs.splice(firstParagraphIndex, lastParagraphIndex - firstParagraphIndex + 1, newParagraph);
            theParagraphToAddLabelInto = newParagraph;
            EventBus.emit('merge_paragraph', {
                startIndex: firstParagraphIndex,
                endIndex: lastParagraphIndex,
                mergedInto: newParagraph
            });
        }
        theParagraphToAddLabelInto.makeSureIndexesInSameSentence(startIndexInRawContent, endIndexInRawContent);
        this.dataSource.addLabel(theLabel);
        EventBus.emit('label_added', theLabel);
    };

    connectLabel(text: string, labelFrom: Label, labelTo: Label) {
        let theConnection = new Connection(text, labelFrom, labelTo);
        this.dataSource.addConnection(theConnection);
        EventBus.emit('label_connected', theConnection);
    };

    getParagraphs(): Array<Paragraph> {
        return this.paragraphs;
    }

    getParagraphForIndex(index: number): [number, Paragraph] {
        for (let i in this.paragraphs) {
            let paragraph = this.paragraphs[i];
            if (paragraph.startIndexInParent <= index && index < paragraph.endIndexInParent) {
                return [i as any as number, paragraph];
            }
        }
    }

    private parseRawContent() {
        let startIndex = 0;
        let endIndex: number;
        let splits = this.data.split('\n').filter((paragraph: string) => paragraph !== '');
        this.data = splits.join('');
        let nextRawParagraphIndex = 0;
        while (nextRawParagraphIndex !== splits.length) {
            let rawParagraph = splits[nextRawParagraphIndex];
            ++nextRawParagraphIndex;
            endIndex = startIndex + rawParagraph.length;
            for (let label of this.labels) {
                if (label.startIndexInRawContent < endIndex && endIndex < label.endIndexInRawContent) {
                    rawParagraph += splits[nextRawParagraphIndex];
                    endIndex = startIndex + rawParagraph.length;
                    ++nextRawParagraphIndex;
                }
            }
            this.paragraphs.push(new Paragraph(this, startIndex, endIndex));
            startIndex = endIndex;
        }
    }
}