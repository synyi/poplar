import {AnnotatorTextElement} from "./Base/AnnotatorTextElement";
import {Sentence} from "../../Store/Sentence";
import {SoftLine} from "./SoftLine";
import * as SVG from "svg.js";
import {TextBlock} from "./TextBlock";

export class HardLine extends AnnotatorTextElement {
    store: Sentence;
    softLines: Array<SoftLine> = [];
    svgElement: SVG.Tspan;

    constructor(store: Sentence, parent: TextBlock) {
        super(store, parent);
    }

    render(context: SVG.Tspan) {
        this.softLines = this.getSoftLines();
        this.svgElement = context.tspan('');
        (this.svgElement as any).AnnotatorElement = this;
        this.softLines.map(it => it.render(this.svgElement));
    }

    private getSoftLines(): Array<SoftLine> {
        let result: Array<SoftLine> = [];
        let startIndex = 0;
        while (startIndex < this.store.length) {
            let endIndex = startIndex + SoftLine.maxWidth;
            if (endIndex > this.store.length) {
                endIndex = this.store.length;
            }
            let crossLabel = this.ancestor.store.getFirstLabelCross(endIndex - this.store.startIndexInAncestor);
            if (crossLabel) {
                endIndex = crossLabel.startIndexInRawContent - this.store.startIndexInAncestor;
            }
            if (startIndex < endIndex) {
                let newSoftline = new SoftLine(this.store, this, startIndex, endIndex);
                result.push(newSoftline);
            }
            startIndex = endIndex;
        }
        return result;
    }

    layoutLabelRenderContext() {
        this.softLines.map(it => it.layoutLabelRenderContext());
        if (this.next) {
            this.next.layoutLabelRenderContext();
        }
        if (this.parent.next) {
            this.parent.next.layoutLabelRenderContext();
        }
    }

    remove() {
        this.softLines.map(it => it.remove());
    }
}