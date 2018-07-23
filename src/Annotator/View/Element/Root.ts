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
            this.textSelected();
        });
        (this.svgElement as any).AnnotatorElement = this;
        this.svgElement.build(true);
        this.textBlocks.map(it => it.render(this.svgElement));
        this.svgElement.build(false);
    }

    textSelected() {
        SelectionHandler.textSelected();
    }

    labelAdded(info: any) {
        if (info.mergeInfo.mergedIntoParagraph || info.mergeInfo.mergedIntoSentence) {
            let context = this.svgElement.parent() as SVG.Doc;
            this.remove();
            this.render(context);
        } else {
            let inTextBlock = this.findTextBlockLabelBelongTo(info.labelAdded);
            inTextBlock.labelAdded(info.labelAdded);
        }
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
        })
    }
}