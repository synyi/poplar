import {Paragraph} from "./Element/Paragraph";
import {DataManager} from "../DataManager/DataManager";
import {TextHolder} from "./Base/TextHolder";
import {Label} from "./Element/Label/Label";
import {Dispatcher} from "../Dispatcher/Dispatcher";
import {AddLabelAction} from "../Action/AddLabel";
import {fromEvent, Observable} from "rxjs";
import {EventEmitter} from "events";
import {AddConnectionAction} from "../Action/AddConnection";
import {Connection} from "./Element/Connection/Connection";

export class Store extends TextHolder {
    static eventEmitter = new EventEmitter();
    static labelAdded$: Observable<Label> = fromEvent(Store.eventEmitter, 'labelAdded');
    static connectionAdded$: Observable<Connection> = fromEvent(Store.eventEmitter, 'connectionAdded');
    children: Array<Paragraph> /*=[]; in base*/;

    constructor(public dataManager: DataManager) {
        super(dataManager.getRawContent());
        this.children = this.makeParagraphs();
        for (let label of dataManager.getLabels()) {
            this.labelAdded(label);
        }
        Dispatcher.register('AddLabelAction', (action: AddLabelAction) => {
            let newLabel = new Label(action.category, action.startIndex, action.endIndex);
            if (this.labelAdded(newLabel)) {
                Store.eventEmitter.emit('labelAdded', newLabel);
            }
            this.dataManager.addLabel(newLabel);
        });
        Dispatcher.register('AddConnectionAction', (action: AddConnectionAction) => {
            let newConnection = new Connection(action.category, action.from, action.to);
            Store.eventEmitter.emit('connectionAdded', newConnection);
            this.dataManager.addConnection(newConnection);
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

    /**
     * @return 是否需要发送Event
     */
    labelAdded(label: Label): boolean {
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
            this.children[startInParagraphIdx].labelAdded(label, false);
            this.children[startInParagraphIdx].emit('textChanged');
            return false;
        }
        return this.children[startInParagraphIdx].labelAdded(label, true);
    }
}