import {AnnotationElementBase} from "./AnnotationElementBase";
import {Sentence} from "../../Store/Sentence";
import {SoftLine} from "./SoftLine";
import {Tspan} from 'svg.js';
import {EventBus} from "../../../library/EventBus";
import {LabelView} from "./LabelView";

export class HardLine extends EventBus implements AnnotationElementBase {
    correspondingStore: Sentence;
    svgElement: any;
    softLines: Array<SoftLine> = [];
    next: HardLine = null;

    constructor(sentence: Sentence) {
        super();
        this.correspondingStore = sentence;
        this.splitSoftLines();
    }

    render(svgDoc: Tspan) {
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
        for (let softLine of this.softLines) {
            softLine.render(this.svgElement);
        }
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
                    endIndex = this.correspondingStore.toLocalIndex(labelCross.startIndexInRawContent);
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