import {LinkedTreeNode} from "../../Common/Base/LinkedTreeNode";
import {TreeNode} from "../../Common/Base/TreeNode";
import {Renderable} from "../Interface/Renderable";
import * as SVG from "svg.js";

export abstract class TextElement extends LinkedTreeNode implements Renderable {
    children: Array<TextElement>/* = [] in base*/;
    nextNode: TextElement/* = null in base*/;
    svgElement: SVG.Element = null;

    protected constructor(parent: TreeNode) {
        super(parent);
    }

    abstract render(context: SVG.Element);

    layoutSelf() {
    }

    layoutChildren() {
        for (let child of this.children) {
            child.layout();
        }
    }

    layout() {
        this.layoutSelf();
        this.layoutChildren();
    }

    layoutAfterSelf() {
        let next: TextElement = this;
        while (next.nextNode && next.nextNode.svgElement) {
            next.nextNode.layout();
            next = next.nextNode;
        }
        if (next.parent instanceof TextElement)
            next.parent.layoutAfterSelf();
    }

    _destructor() {
        this.svgElement = null;
        super._destructor();
    }
}