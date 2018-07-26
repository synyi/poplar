import {LinkedTreeNode} from "../../Public/Base/LinkedTreeNode";
import {Renderable} from "../Interface/Renderable";
import * as SVG from "svg.js";
import {HardLine} from "./HardLine";
import {Paragraph} from "../../Store/Paragraph";
import {Root} from "./Root";
import {Sentence} from "../../Store/Sentence";
import {LabelAdded} from "../../Store/Event/LabelAdded";

export class TextBlock extends LinkedTreeNode implements Renderable {
    svgElement: SVG.Tspan;
    next: TextBlock;

    constructor(public store: Paragraph,
                public parent: Root) {
        super(parent);
    }

    _children: Array<HardLine> = null;

    get children(): Array<HardLine> {
        if (this._children === null) {
            this._children = this.store.children.map((sentence: Sentence) => {
                return new HardLine(sentence, this);
            });
            for (let i = 0; i < this._children.length - 1; ++i) {
                this._children[i].next = this._children[i + 1];
            }
        }
        return this._children;
    }

    set children(value) {
        this._children = value;
    }

    layoutLabelRenderContext() {
        this.children.map(it => it.layoutLabelRenderContext());
    }

    layoutLabelsRenderContextAfterSelf() {
        let nextTextBlock: TextBlock = this;
        while (nextTextBlock.next && nextTextBlock.next.svgElement) {
            nextTextBlock.next.layoutLabelRenderContext();
            nextTextBlock = nextTextBlock.next;
        }
    }

    render(context: SVG.Text) {
        this.svgElement = context.tspan('');
        (this.svgElement as any).AnnotatorElement = this;
        this.children.map(it => it.render(this.svgElement));
    }


    rerender() {
        this.children.map(it => it.removeLabelViews());
        this.svgElement.clear();
        this._children = null;
        this.children.map(it => it.render(this.svgElement));
    }

    remove() {
        this.children.map(it => it.removeLabelViews());
        this.svgElement.node.remove();
    }

    labelAdded(info: LabelAdded) {
        let inHardlineIndex = this.children.findIndex(it => it.store === info.sentenceIn);
        if (info.removedSentences !== null) {
            let endTextBlockIndex = inHardlineIndex + info.removedSentences.length + 1;
            this.children[inHardlineIndex].next = this.children[endTextBlockIndex];
            // f**k difference between undefined and null
            // I believe if we keep it "undefined" here, it may also work
            // but I'd like to stick to "null"
            if (!(this.children[inHardlineIndex].next)) {
                this.children[inHardlineIndex].next = null;
            }
            this.children.slice(inHardlineIndex + 1, endTextBlockIndex).map(it => {
                it.remove();
            });
            this.children.splice(inHardlineIndex + 1, endTextBlockIndex - inHardlineIndex - 1);
        }
        this.children[inHardlineIndex].rerender();
    }
}