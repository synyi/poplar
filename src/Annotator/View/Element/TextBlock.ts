import {AnnotatorTextElement} from "./Base/AnnotatorTextElement";
import * as SVG from "svg.js";
import {Paragraph} from "../../Store/Paragraph";
import {HardLine} from "./HardLine";
import {Sentence} from "../../Store/Sentence";
import {Root} from "./Root";
import {Label} from "../../Store/Label";

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
        for (let i = 0; i < this.hardLines.length - 1; ++i) {
            this.hardLines[i].next = this.hardLines[i + 1];
        }
        this.hardLines.map(it => it.render(this.svgElement));
    }

    remove() {
        this.hardLines.map(it => it.remove());
    }

    labelAdded(label: Label, mergedSentences?: Array<Sentence>, mergedIntoSentence?: Sentence) {
        if (mergedIntoSentence) {
            this.mergeHardLines(mergedSentences, mergedIntoSentence);
        } else {
            let inHardline = this.findHardlineLabelBelongTo(label);
            inHardline.rerender();
        }
    }

    layoutLabelRenderContext() {
        this.hardLines.map(it => it.layoutLabelRenderContext());
    }

    layoutLabelsRenderContextAfterSelf() {
        let nextTextBlock = this;
        while (nextTextBlock.next) {
            nextTextBlock.next.layoutLabelRenderContext();
            nextTextBlock = nextTextBlock.next;
        }
    }

    private findHardlineLabelBelongTo(label: Label): HardLine {
        return this.hardLines.find((hardLine: HardLine) => {
            return hardLine.store.startIndexInAncestor <= label.startIndexInRawContent && label.endIndexInRawContent <= hardLine.store.endIndexInAncestor;
        })
    }

    rerender() {
        this.remove();
        this.svgElement.clear();
        this.hardLines = this.getHardLines();
        for (let i = 0; i < this.hardLines.length - 1; ++i) {
            this.hardLines[i].next = this.hardLines[i + 1];
        }
        this.hardLines.map(it => it.render(this.svgElement));
    }

    private mergeHardLines(mergedSentences: Array<Sentence>, mergedIntoSentence: Sentence) {
        let firstSentence = mergedSentences[0];
        let lastSentence = mergedSentences[mergedSentences.length - 1];
        let firstIndex = this.hardLines.findIndex(it => {
            return it.store === firstSentence;
        });
        let lastIndex = this.hardLines.findIndex(it => {
            return it.store === lastSentence;
        });
        let firstHardLine = this.hardLines[firstIndex];
        this.hardLines.slice(firstIndex + 1, lastIndex + 1).map(it => {
            it.remove();
            it.svgElement.clear();
        });
        this.hardLines[firstIndex].next = this.hardLines[lastIndex + 1];
        firstHardLine.store = mergedIntoSentence;
        firstHardLine.rerender();
    }
}