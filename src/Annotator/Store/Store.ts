import {Paragraph} from "./Paragraph";
import {Label} from "./Label";
import {DataSource} from "./DataSource";
import {ResourceHolder} from "./Base/ResourceHolder";
import {Dispatcher} from "../Dispatcher/Dispatcher";
import {AddLabelAction} from "../Action/AddLabel";
import {AddConnectionAction} from "../Action/AddConnection";
import {Connection} from "./Connection";

export class Store extends ResourceHolder {
    children: Array<Paragraph>;

    constructor(public dataSource: DataSource) {
        super(dataSource.getRawContent());
        this.children = this.makeParagraphs();
        this.dataSource.getLabels().sort(Label.compare).map(it => this.labelAdded(it));
        this.connections = dataSource.getConnections();
        Dispatcher.register('AddLabelAction', (action: AddLabelAction) => {
            this.dataSource.requireLabelText()
                .then((text) => {
                    let newLabel = new Label(text, action.startIndex, action.endIndex);
                    this.labelAdded(newLabel);
                    this.dataSource.addLabel(newLabel);
                });
        });
        Dispatcher.register('AddConnectionAction', (action: AddConnectionAction) => {
            this.dataSource.requireConnectionText()
                .then((text) => {
                    let newConnection = new Connection(text, action.from, action.to);
                    this.connectionAdded(newConnection);
                    this.dataSource.addConnection(newConnection);
                });
        })
    }

    labelAdded(label: Label) {
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
        }
        this.children[startInParagraphIdx].labelAdded(label);
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

    private connectionAdded(newConnection: Connection) {
        this.connections.push(newConnection);
    }
}
