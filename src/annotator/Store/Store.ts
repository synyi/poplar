import {EventBase} from "../../library/EventBase";
import {Connection} from "./Connection";
import {AnnotatorDataSource} from "./AnnotatorDataSource";
import {Label} from "./Label";
import {Sentence} from "./Sentence";

export class Store extends EventBase {
    constructor(private dataSource: AnnotatorDataSource) {
        super();
    }

    addLabel(sentenceBelongTo: Sentence, startIndex: number, endIndex: number) {
        let theLabel = new Label(sentenceBelongTo, startIndex, endIndex);
        this.dataSource.addLabel(theLabel);
        this.emit('label_added', theLabel);
    };

    connectLabel(text: string, labelFrom: Label, labelTo: Label) {
        let theConnection = new Connection(text, labelFrom, labelTo);
        this.dataSource.addConnection(theConnection);
        this.emit('label_connected', theConnection);
    };
}