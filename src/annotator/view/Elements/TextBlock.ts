import {AnnotationElementBase} from "./AnnotationElementBase";
import {Paragraph} from "../../Store/Paragraph";
import {Text} from "svg.js";
import {HardLine} from "./HardLine";
import {Sentence} from "../../Store/Sentence";

export class TextBlock implements AnnotationElementBase {
    correspondingStore: Paragraph;
    svgElement: any;
    lines: Array<HardLine> = [];

    constructor(paragraph: Paragraph) {
        this.correspondingStore = paragraph;
        for (let sentence of paragraph.sentences) {
            this.lines.push(new HardLine(sentence as any as Sentence));
        }
    }

    render(svgDoc: Text) {
        this.svgElement = svgDoc.tspan('');
        for (let line of this.lines) {
            line.render(this.svgElement);
        }
        this.svgElement.tspan(' ').newLine();
    }

    rerender() {
        this.svgElement.clear();
        for (let line of this.lines) {
            line.render(this.svgElement);
        }
        this.svgElement.newLine()
    }

}