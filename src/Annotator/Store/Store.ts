import {Paragraph} from "./Element/Paragraph";
import {DataSource} from "../DataSource/DataSource";
import {TextHolder} from "./Base/TextHolder";
import {Label} from "./Element/Label/Label";
import {Dispatcher} from "../Dispatcher/Dispatcher";
import {AddLabelAction} from "../Action/AddLabel";
import {LabelCategory} from "./Element/Label/LabelCategory";
import {fromEvent, Observable} from "rxjs";
import {EventEmitter} from "events";
import {AddConnectionAction} from "../Action/AddConnection";
import {Connection} from "./Element/Connection/Connection";

export class Store extends TextHolder {
    static eventEmitter = new EventEmitter();
    static labelAdded$: Observable<Label> = fromEvent(Store.eventEmitter, 'labelAdded');
    static connectionAdded$: Observable<Connection> = fromEvent(Store.eventEmitter, 'connectionAdded');
    children: Array<Paragraph> /*=[]; in base*/;

    constructor(public dataSource: DataSource) {
        super(dataSource.getRawContent());
        this.children = this.makeParagraphs();
        for (let label of dataSource.getLabels()) {
            this.labelAdded(label);
        }
        Dispatcher.register('AddLabelAction', (action: AddLabelAction) => {
            this.dataSource.requireLabelCategory()
                .then((category: LabelCategory) => {
                    let newLabel = new Label(category, action.startIndex, action.endIndex);
                    if (!this.labelAdded(newLabel)) {
                        Store.eventEmitter.emit('labelAdded', newLabel);
                    }
                    this.dataSource.addLabel(newLabel);
                });
        });
        Dispatcher.register('AddConnectionAction', (action: AddConnectionAction) => {
            this.dataSource.requireConnectionCategory()
                .then((category) => {
                    let newConnection = new Connection(category, action.from, action.to);
                    Store.eventEmitter.emit('connectionAdded', newConnection);
                    this.dataSource.addConnection(newConnection);
                });
        })
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

    labelAdded(label: Label) {
        let startInParagraphIdx = this.children.findIndex((paragraph: Paragraph) => {
            return paragraph.globalStartIndex <= label.startIndex &&
                label.startIndex < paragraph.globalEndIndex;
        });
        let endInParagraphIdx = this.children.findIndex((paragraph: Paragraph) => {
            return paragraph.globalStartIndex < label.endIndex &&
                label.endIndex <= paragraph.globalEndIndex;
        });
        if (startInParagraphIdx === -1 || endInParagraphIdx === -1)
            return null;
        if (startInParagraphIdx !== endInParagraphIdx) {
            let removedParagraphs = this.children.slice(startInParagraphIdx + 1, endInParagraphIdx + 1);
            this.children[startInParagraphIdx].swallowArray(removedParagraphs);
        }
        return !!this.children[startInParagraphIdx].labelAdded(label);

    }
}