import {AnnotationElementBase} from "./AnnotationElementBase";
import {Sentence} from "../../Store/Sentence";
import {Tspan} from 'svg.js'

const DEFAULT_LINE_HEIGHT = 20.8;

export class SoftLine implements AnnotationElementBase {
    static suggestWidth = 80;

    correspondingStore: Sentence;
    svgElement: any;
    marginTopRowsCount = 0;

    constructor(store: Sentence,
                private startIndexInHard: number,
                private endIndexInHard: number
    ) {
        this.correspondingStore = store;
    }

    render(svgDoc: Tspan) {
        this.svgElement = svgDoc.tspan(this.correspondingStore.slice(this.startIndexInHard, this.endIndexInHard)).newLine();
        this.layout();
    }

    rerender() {
        this.svgElement.text(this.correspondingStore.slice(this.startIndexInHard, this.endIndexInHard));
        this.layout();
    }

    layout() {
        this.svgElement.dy(DEFAULT_LINE_HEIGHT + this.marginTopRowsCount * 30);
    }
}