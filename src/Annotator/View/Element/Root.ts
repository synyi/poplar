import {AnnotatorTextElement} from "./Base/AnnotatorTextElement";
import {Store} from "../../Store/Store";
import * as SVG from "svg.js";
import {TextBlock} from "./TextBlock";
import {Paragraph} from "../../Store/Paragraph";
import {SelectionHandler} from "../SelectionHandler";
import {EventBus} from "../../Tools/EventBus";
import {Label} from "../../Store/Label";

export class Root extends AnnotatorTextElement {
    store: Store;
    textBlocks: Array<TextBlock> = [];
    svgElement: SVG.Text;

    constructor(store: Store) {
        super(store);
        EventBus.on('label_added', (info: any) => {
            this.labelAdded(info);
        });
    }

    private getTextBlocks() {
        return this.store.paragraphs.map((paragraph: Paragraph) => {
            return new TextBlock(paragraph, this);
        });
    }

    render(context: SVG.Doc) {
        this.textBlocks = this.getTextBlocks();
        for (let i = 0; i < this.textBlocks.length - 1; ++i) {
            this.textBlocks[i].next = this.textBlocks[i + 1];
        }
        this.svgElement = context.text('').dx(10);
        context.on("mouseup", () => {
            SelectionHandler.textSelected();
        });
        (this.svgElement as any).AnnotatorElement = this;
        this.svgElement.build(true);
        this.textBlocks.map(it => it.render(this.svgElement));
        this.svgElement.build(false);
    }

    labelAdded(info: any) {
        if (info.mergeInfo.mergedIntoParagraph) {
            this.mergeTextBlocks(info.mergeInfo.mergedParagraphs, info.mergeInfo.mergedIntoParagraph);
        } else if (info.mergeInfo.mergedIntoSentence) {
            let inTextBlock = this.findTextBlockLabelBelongTo(info.labelAdded);
            inTextBlock.labelAdded(info.labelAdded, info.mergeInfo.mergedSentences, info.mergeInfo.mergedIntoSentence);
        } else {
            let inTextBlock = this.findTextBlockLabelBelongTo(info.labelAdded);
            inTextBlock.labelAdded(info.labelAdded);
        }
        window.getSelection().removeAllRanges();
    }

    private mergeTextBlocks(mergedParagraphs: Array<Paragraph>, mergedIntoParagraph: Paragraph) {
        let firstParagraph = mergedParagraphs[0];
        let lastParagraph = mergedParagraphs[mergedParagraphs.length - 1];
        let firstIndex = this.textBlocks.findIndex(it => {
            return it.store === firstParagraph;
        });
        let lastIndex = this.textBlocks.findIndex(it => {
            return it.store === lastParagraph;
        });
        let firstTextBlock = this.textBlocks[firstIndex];
        this.textBlocks.slice(firstIndex + 1, lastIndex + 1).map(it => {
            it.remove();
            it.svgElement.clear();
        });
        this.textBlocks[firstIndex].next = this.textBlocks[lastIndex + 1];
        this.textBlocks.splice(firstIndex + 1, lastIndex - firstIndex);
        firstTextBlock.store = mergedIntoParagraph;
        firstTextBlock.rerender();
    }

    layoutLabelRenderContext() {
    }

    remove() {
        this.textBlocks.map(it => it.remove());
        this.svgElement.remove();
    }

    layoutLabelsRenderContextAfterSelf() {
    }

    private findTextBlockLabelBelongTo(label: Label): TextBlock {
        return this.textBlocks.find((textBlock: TextBlock) => {
            return textBlock.store.startIndexInAncestor <= label.startIndexInRawContent && label.endIndexInRawContent <= textBlock.store.endIndexInAncestor;
        });
    }
}