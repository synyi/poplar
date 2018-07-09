import {AnnotationElementBase} from "./AnnotationElementBase";
import {Paragraph} from "../../Store/Paragraph";
import {HardLine} from "./HardLine";

export class TextBlock implements AnnotationElementBase {
    store: Paragraph;
    svgElement: any;
    hardLines: Array<HardLine> = [];
    next: TextBlock = null;

    constructor(paragraph: Paragraph) {
        this.setStore(paragraph)
    }

    setStore(paragraph: Paragraph) {
        this.store = paragraph;
        this.hardLines = this.divideHardLines();
    }

    render(svgDrawingContext: any) {
        this.svgElement = svgDrawingContext.tspan('');
        this.svgElement.annotationObject = this;
        for (let line of this.hardLines) {
            line.render(this.svgElement);
        }
        this.svgElement.tspan(' ').newLine();
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

    remove() {
        this.svgElement.remove();
    }

    rerender() {
        this.svgElement.clear();
        for (let line of this.hardLines) {
            line.render(this.svgElement);
        }
        this.svgElement.tspan(' ').newLine();
    }

    private divideHardLines() {
        let result = [];
        let lastHardLine: HardLine = null;
        for (let sentence of this.store.sentences) {
            let newHardLine = new HardLine(sentence);
            if (lastHardLine !== null) {
                lastHardLine.next = newHardLine;
            }
            result.push(newHardLine);
            lastHardLine = newHardLine;
        }
        return result;
    }

}