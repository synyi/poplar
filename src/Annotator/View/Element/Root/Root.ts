import {TreeNode} from "../../../Public/Base/TreeNode";
import * as SVG from "svg.js";
import {TextBlock} from "../TextBlock";
import {Paragraph} from "../../../Store/Paragraph";
import {Store} from "../../../Store/Store";
import {LabelAdded} from "../../../Store/Event/LabelAdded";
import {RenderBehaviour} from "./RenderBehaviour/RenderBehaviour";

export class Root extends TreeNode {
    svgElement: SVG.Text;

    constructor(private store: Store, public renderBehaviour: RenderBehaviour) {
        super()
    }

    _children: Array<TextBlock>;

    get children(): Array<TextBlock> {
        if (this._children === null) {
            this._children = this.store.children.map((paragraph: Paragraph) => {
                return new TextBlock(paragraph, this);
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

    labelAdded(info: LabelAdded) {
        let inTextBlockIndex = this.children.findIndex(it => it.store === info.paragraphIn);
        if (info.removedParagraphs !== null) {
            let endTextBlockIndex = inTextBlockIndex + info.removedParagraphs.length + 1;
            this.children[inTextBlockIndex].next = this.children[endTextBlockIndex];
            // f**k difference between undefined and null
            // I believe if we keep it "undefined" here, it may also work
            // but I'd like to stick to "null"
            if (!(this.children[inTextBlockIndex].next)) {
                this.children[inTextBlockIndex].next = null;
            }
            this.children.slice(inTextBlockIndex + 1, endTextBlockIndex).map(it => {
                it.remove();
            });
            this.children.splice(inTextBlockIndex + 1, endTextBlockIndex - inTextBlockIndex - 1);
            this.children[inTextBlockIndex].rerender();
        } else {
            this.children[inTextBlockIndex].labelAdded(info);
        }
    }

    render(context: SVG.Doc) {
        this.svgElement = context.text('').dx(10);
        this.renderBehaviour.render(this.children, this.svgElement);
    }
}