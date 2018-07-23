import {AnnotatorTextElement} from "./Base/AnnotatorTextElement";
import * as SVG from "svg.js";
import {Paragraph} from "../../Store/Paragraph";
import {HardLine} from "./HardLine";
import {Sentence} from "../../Store/Sentence";
import {Root} from "./Root";

export class TextBlock extends AnnotatorTextElement {
    hardLines: Array<HardLine> = [];
    svgElement: SVG.Tspan;
    store: Paragraph;

    constructor(store: Paragraph, parent: Root) {
        super(store, parent);
    }

    private getHardLines() {
        return this.store.sentences.map((sentence: Sentence) => {
            return new HardLine(sentence, this);
        });
    }

    render(context: SVG.Text) {
        this.hardLines = this.getHardLines();
        this.svgElement = context.tspan('');
        (this.svgElement as any).AnnotatorElement = this;
        this.hardLines.map(it => it.render(this.svgElement));
    }

    layoutLabelRenderContext() {
        this.hardLines.map(it => it.layoutLabelRenderContext());
        if (this.next) {
            this.next.layoutLabelRenderContext();
        }
    }

    remove() {
        this.hardLines.map(it => it.remove());
    }
}