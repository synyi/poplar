import {SoftLine} from "./SoftLine";
import {Tspan} from "svg.js";
import {Sentence} from "../../Store/Sentence";
import {AnnotationElementBase} from "./AnnotationElementBase";
import {LabelView} from "./LabelView";
import {Label} from "../../Store/Label";
import {EventBase} from "../../../library/EventBase";

export class HardLine extends EventBase implements AnnotationElementBase {
    correspondingStore: Sentence;

    softLines: Array<SoftLine> = [];

    svgElement: any;

    constructor(sentence: Sentence) {
        super();
        this.correspondingStore = sentence;
        let startIndex = 0;
        while (startIndex < this.correspondingStore.length()) {
            let endIndex = startIndex + SoftLine.suggestWidth;
            if (endIndex > this.correspondingStore.length()) {
                endIndex = this.correspondingStore.length();
            }
            let newSoftLine = new SoftLine(sentence, startIndex, endIndex);
            this.softLines.push();
            let labels = sentence.labels.filter((label: Label) => label.startIndex >= startIndex && label.endIndex <= endIndex);
            // console.log(sentence.labels);
            labels.map((label: Label) => new LabelView(label, newSoftLine));
            this.softLines.push(newSoftLine);
            startIndex += SoftLine.suggestWidth;
        }
        EventBase.on('label_added', (_, label: Label) => {
            if (label.sentenceBelongTo != this.correspondingStore) {
                return;
            }
            for (let softline of this.softLines) {
                if ((softline as any as SoftLine).startIndexInHard <= label.startIndex && label.endIndex <= (softline as any as SoftLine).endIndexInHard) {
                    new LabelView(label, softline);
                    softline.rerender();
                    break;
                }
            }
        });
    }

    render(svgDoc: Tspan) {
        // console.log("Rendering Hard Line", this);
        this.svgElement = svgDoc.tspan('');
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
}