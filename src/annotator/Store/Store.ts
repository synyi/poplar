import {EventBase} from "../../library/EventBase";
import {Connection} from "./Connection";
import {AnnotatorDataSource} from "./AnnotatorDataSource";
import {Label} from "./Label";
import {Sentence} from "./Sentence";
import {Paragraph} from "./Paragraph";

export class Store extends EventBase {
    rawContent: string;
    paragraphs: Array<Paragraph> = [];

    constructor(public dataSource: AnnotatorDataSource) {
        super();
        this.rawContent = this.dataSource.getRawContent();
        this.getParagraphs();
    }

    addLabel(text: string, sentenceBelongTo: Sentence, startIndex: number, endIndex: number) {
        let theLabel = new Label(text, sentenceBelongTo, startIndex, endIndex);
        this.dataSource.addLabel(theLabel);
        this.emit('label_added', theLabel);
    };

    connectLabel(text: string, labelFrom: Label, labelTo: Label) {
        let theConnection = new Connection(text, labelFrom, labelTo);
        this.dataSource.addConnection(theConnection);
        this.emit('label_connected', theConnection);
    };

    getParagraphs(): Array<Paragraph> {
        if (this.paragraphs.length === 0) {
            let startIndex = 0;
            let endIndex: number;
            for (let rawParagraph of this.rawContent.split('\n')) {
                endIndex = startIndex + rawParagraph.length;
                this.paragraphs.push(new Paragraph(this, startIndex, endIndex));
                startIndex = endIndex + 1;
            }
        }
        return this.paragraphs;
    }

    slice(startIndex?: number, endIndex?: number): string {
        return this.rawContent.slice(startIndex, endIndex);
    }
}