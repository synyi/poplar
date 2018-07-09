import {AnnotationElementBase} from "./AnnotationElementBase";
import {Sentence} from "../../Store/Sentence";
import {SoftLine} from "./SoftLine";
import {EventBus} from "../../../library/EventBus";
import {LabelView} from "./LabelView";

export class HardLine extends EventBus implements AnnotationElementBase {
    store: Sentence;
    svgElement: any;
    softLines: Array<SoftLine> = [];
    next: HardLine = null;

    constructor(sentence: Sentence) {
        super();
        this.store = sentence;
        this.splitSoftLines();
    }

    render(svgDoc: any) {
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
        while (startIndex < this.store.length()) {
            let endIndex = startIndex + SoftLine.suggestWidth;
            if (endIndex > this.store.length()) {
                endIndex = this.store.length();
            } else {
                let labelCross = this.store.getFirstLabelCross(endIndex);
                if (labelCross) {
                    endIndex = this.store.toLocalIndex(labelCross.startIndexInRawContent);
                }
            }
            let newSoftLine = new SoftLine(this.store, startIndex, endIndex);
            if (lastSoftLine !== null) {
                lastSoftLine.next = newSoftLine;
            }
            this.softLines.push(newSoftLine);
            lastSoftLine = newSoftLine;
            startIndex = endIndex;
        }
    }
}