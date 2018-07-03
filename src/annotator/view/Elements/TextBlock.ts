import {AnnotationElementBase} from "./AnnotationElementBase";
import {Paragraph} from "../../Store/Paragraph";
import {HardLine} from "./HardLine";

export class TextBlock implements AnnotationElementBase {
    correspondingStore: Paragraph;
    svgElement: any;
    hardLines: Array<HardLine> = [];
    next: TextBlock = null;

    constructor(paragraph: Paragraph) {
        this.correspondingStore = paragraph;
        let lastHardLine: HardLine = null;
        for (let sentence of this.correspondingStore.sentences) {
            let newHardLine = new HardLine(sentence);
            if (lastHardLine !== null) {
                lastHardLine.next = newHardLine;
            }
            this.hardLines.push(newHardLine);
            lastHardLine = newHardLine;
        }
    }

    layout() {
        this.hardLines.map((it: HardLine) => it.layout());
        if (this.next) {
            this.next.layout();
        }
    }

    layoutLabels() {
        this.hardLines.map((hardLine: HardLine) => hardLine.layoutLabels());
        if (this.next)
            this.next.layoutLabels();
    }

    render(svgDoc: any) {
        // console.log("Rendering Text Block", this);
        this.svgElement = svgDoc.tspan('');
        this.svgElement.annotationObject = this;
        for (let line of this.hardLines) {
            line.render(this.svgElement);
        }
        this.svgElement.tspan(' ').newLine();
    }

    rerender() {
        this.svgElement.clear();
        for (let line of this.hardLines) {
            line.render(this.svgElement);
        }
        this.svgElement.tspan(' ').newLine();
    }

}