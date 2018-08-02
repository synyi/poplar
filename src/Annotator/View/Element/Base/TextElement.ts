import {LinkedTreeNode} from "../../../Public/Base/LinkedTreeNode";
import {Renderable} from "../../Interface/Renderable";
import * as SVG from "svg.js";

export abstract class TextElement extends LinkedTreeNode implements Renderable {
    children: Array<TextElement>;
    next: TextElement;
    svgElement: SVG.Element;

    // we'll not provide "onRender" in base class
    // some class may not need it
    abstract render(context: SVG.Element);

    rerender() {
        this.children.map(it => it.onRemove());
        (this.svgElement as any).clear();
        this.children = null;
        this.children.map(it => it.render(this.svgElement));
    }

    remove() {
        this.onRemove();
        this.svgElement.node.remove();
    }

    onRemove() {
        this.children.map(it => it.onRemove());
    }

    layout() {
        this.children.map(it => it.layout());
    }

    layoutAfterSelf() {
        let next: TextElement = this;
        while (next.next && next.next.svgElement) {
            next.next.layout();
            next = next.next;
        }
        if (next.parent instanceof TextElement)
            next.parent.layoutAfterSelf();
    }
}