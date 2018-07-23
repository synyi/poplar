import {AnnotatorTextElement} from "./Base/AnnotatorTextElement";
import {Store} from "../../Store/Store";
import * as SVG from "svg.js";
import {TextBlock} from "./TextBlock";
import {Paragraph} from "../../Store/Paragraph";
import {SelectionHandler} from "../SelectionHandler";
import {Label} from "../../Store/Label";
import {EventBus} from "../../Tools/EventBus";

export class Root extends AnnotatorTextElement {
    store: Store;
    textBlocks: Array<TextBlock> = [];
    svgElement: SVG.Text;

    constructor(store: Store) {
        super(store);
        EventBus.on('label_added', (label: Label) => {
            this.labelAdded(label);
        });
    }

    private getTextBlocks() {
        return this.store.paragraphs.map((paragraph: Paragraph) => {
            return new TextBlock(paragraph, this);
        });
    }

    render(context: SVG.Doc) {
        this.textBlocks = this.getTextBlocks();
        this.svgElement = context.text('').dx(10);
        context.on("mouseup", () => {
            this.textSelected();
        });
        (this.svgElement as any).AnnotatorElement = this;
        this.svgElement.build(true);
        this.textBlocks.map(it => it.render(this.svgElement));
        this.svgElement.build(false);
    }

    layoutLabelRenderContext() {
        this.textBlocks.map(it => it.layoutLabelRenderContext());
    }

    textSelected() {
        SelectionHandler.textSelected();
    }

    labelAdded(label: Label) {
        let context = this.svgElement.parent() as SVG.Doc;
        this.remove();
        this.render(context);
    }

    remove() {
        this.textBlocks.map(it => it.remove());
        this.svgElement.remove();
    }
}