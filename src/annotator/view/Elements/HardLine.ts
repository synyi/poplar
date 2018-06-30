import {SoftLine} from "./SoftLine";
import {Tspan} from "svg.js";
import {Sentence} from "../../Store/Sentence";
import {AnnotationElementBase} from "./AnnotationElementBase";

export class HardLine implements AnnotationElementBase {
    correspondingStore: Sentence;

    softLines: Array<SoftLine> = [];

    svgElement: any;

    constructor(sentence: Sentence) {
        this.correspondingStore = sentence;
        let startIndex = 0;
        while (startIndex < this.correspondingStore.length()) {
            let endIndex = startIndex + SoftLine.suggestWidth;
            if (endIndex > this.correspondingStore.length()) {
                endIndex = this.correspondingStore.length();
            }
            this.softLines.push(new SoftLine(sentence, startIndex, endIndex));
            startIndex += SoftLine.suggestWidth;
        }
    }

    render(svgDoc: Tspan) {
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