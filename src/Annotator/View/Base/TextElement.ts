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

    layoutSelf(deltaY: number) {
    }

    layoutChildren(deltaY: number) {
        for (let child of this.children) {
            child.layout(deltaY);
        }
    }

    layout(deltaY: number) {
        this.layoutSelf(deltaY);
        this.layoutChildren(deltaY);
    }

    layoutAfterSelf(deltaY: number) {
        let next: TextElement = this;
        while (next.nextNode && next.nextNode.svgElement) {
            next.nextNode.layout(deltaY);
            next = next.nextNode;
        }
        if (next.parent instanceof TextElement)
            next.parent.layoutAfterSelf(deltaY);
    }

    _destructor() {
        this.svgElement = null;
        super._destructor();
    }
}