import {AnnotationElementBase} from "./AnnotationElementBase";
import {Sentence} from "../../Store/Sentence";
import {SoftLine} from "./SoftLine";
import {Tspan} from "svg.js";
import {EventBase} from "../../../library/EventBase";
import {Label} from "../../Store/Label";

export class HardLine extends EventBase implements AnnotationElementBase {
    correspondingStore: Sentence;
    svgElement: any;
    softLines: Array<SoftLine> = [];
    next: HardLine = null;

    constructor(sentence: Sentence) {
        super();
        this.correspondingStore = sentence;
        let lastSoftLine: SoftLine = null;
        let startIndex = 0;
        while (startIndex < this.correspondingStore.length()) {
            let endIndex = startIndex + SoftLine.suggestWidth;
            if (endIndex > this.correspondingStore.length()) {
                endIndex = this.correspondingStore.length();
            }
            let newSoftLine = new SoftLine(sentence, startIndex, endIndex);
            if (lastSoftLine !== null) {
                lastSoftLine.next = newSoftLine;
            }
            this.softLines.push(newSoftLine);
            lastSoftLine = newSoftLine;
            startIndex += SoftLine.suggestWidth;
        }
    }

    layout() {
        this.softLines.map((it: SoftLine) => it.layout());
        // if (this.next) {
        //     this.next.layout();
        // } else if (this.svgElement.parent().annotationObject && this.svgElement.parent().annotationObject.next) {
        //     this.svgElement.parent().annotationObject.next.layout();
        // }
    }

    render(svgDoc: Tspan) {
        // console.log("Rendering Hard Line", this);
        EventBase.on('label_added', (_, label: Label) => {
            if (label.sentenceBelongTo === this.correspondingStore) {
                for (let softline of this.softLines) {
                    if (softline.startIndexInHard <= label.startIndexInSentence && label.endIndexInSentence <= softline.endIndexInHard) {
                        softline.addLabel(label);
                        break;
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

    rerender() {
        this.svgElement.clear();
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
}