import {AnnotationElementBase} from "./AnnotationElementBase";
import {Sentence} from "../../Store/Sentence";
import {SoftLine} from "./SoftLine";
import {Tspan} from "svg.js";
import {EventBase} from "../../../library/EventBase";
import {Label} from "../../Store/Label";
import {AddLabelAction} from "../../Action/AddLabel";
import {LabelView} from "./LabelView";

export class HardLine extends EventBase implements AnnotationElementBase {
    correspondingStore: Sentence;
    svgElement: any;
    softLines: Array<SoftLine> = [];
    next: HardLine = null;

    constructor(sentence: Sentence) {
        super();
        this.correspondingStore = sentence;
        this.splitSoftLines();
    }

    static getSelectionInfo() {
        const selection = window.getSelection();
        const startElement = selection.anchorNode;
        const endElement = selection.focusNode;
        // 选取的是[startIndex, endIndex)之间的范围
        let startIndex = selection.anchorOffset + (startElement.parentNode as any).instance.annotationObject.startIndexInHard;
        let endIndex = selection.focusOffset + (endElement.parentNode as any).instance.annotationObject.startIndexInHard;
        if (startIndex > endIndex) {
            let temp = startIndex;
            startIndex = endIndex;
            endIndex = temp;
        }
        let selectedString = startElement.parentNode.parentNode.textContent;
        while (selectedString[startIndex] === ' ') {
            ++startIndex;
        }
        while (selectedString[endIndex - 1] === ' ') {
            --endIndex;
        }
        if (startIndex === endIndex) {
            return;
        }
        selectedString = selectedString.slice(startIndex, endIndex);
        return {
            startIndex: startIndex,
            endIndex: endIndex,
            selectedString: selectedString
        }
    }

    render(svgDoc: Tspan) {
        // console.log("Rendering Hard Line", this);
        EventBase.on('label_added', (_, label: Label) => {
            if (label.sentenceBelongTo === this.correspondingStore) {
                this.rerender();
                if (this.next) {
                    this.next.layoutLabels();
                } else {
                    if (this.svgElement.parent().annotationObject.next) {
                        this.svgElement.parent().annotationObject.next.layoutLabels()
                    }
                }
            }
        });
        this.svgElement = svgDoc.tspan('');
        this.svgElement.annotationObject = this;
        for (let softLine of this.softLines) {
            softLine.render(this.svgElement);
        }
    }

    layout() {
        this.softLines.map((it: SoftLine) => it.layout());
    }

    rerender() {
        this.svgElement.clear();
        this.softLines.map((softline: SoftLine) => {
            softline.labels.map((label: LabelView) => {
                label.svgElement.remove();
            });
        });
        this.softLines = [];
        console.log(this.correspondingStore);
        this.splitSoftLines();
        for (let softLine of this.softLines) {
            softLine.render(this.svgElement);
        }
    }

    textSelected() {
        let selectionInfo = HardLine.getSelectionInfo();
        AddLabelAction.emit(selectionInfo.selectedString, this.correspondingStore,
            selectionInfo.startIndex, selectionInfo.endIndex);
    }

    layoutLabels() {
        this.softLines.map((softline: SoftLine) => softline.layoutLabels());
        if (this.next)
            this.next.layoutLabels();
        if (this.svgElement.parent() && this.svgElement.parent().node.nextSibling) {
            let instance = this.svgElement.parent().node.nextSibling.instance;
            if (instance.annotationObject) {
                instance.annotationObject.layoutLabels();
            }
        }
    }

    private splitSoftLines() {
        let lastSoftLine: SoftLine = null;
        let startIndex = 0;
        while (startIndex < this.correspondingStore.length()) {
            let endIndex = startIndex + SoftLine.suggestWidth;
            if (endIndex > this.correspondingStore.length()) {
                endIndex = this.correspondingStore.length();
            } else {
                let labelCross = this.correspondingStore.getFirstLabelCross(endIndex);
                if (labelCross) {
                    endIndex = labelCross.startIndexInSentence;
                }
            }
            let newSoftLine = new SoftLine(this.correspondingStore, startIndex, endIndex);
            if (lastSoftLine !== null) {
                lastSoftLine.next = newSoftLine;
            }
            this.softLines.push(newSoftLine);
            lastSoftLine = newSoftLine;
            startIndex = endIndex;
        }
    }
}