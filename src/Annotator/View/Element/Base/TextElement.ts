import {LinkedTreeNode} from "../../../Public/Base/LinkedTreeNode";
import {Renderable} from "../../Interface/Renderable";
import * as SVG from "svg.js";

export abstract class TextElement extends LinkedTreeNode implements Renderable {
    children: Array<TextElement>;
    next: TextElement;
    svgElement: SVG.Element;

    abstract render(context: SVG.Element);

    rerender() {
        this.children.map(it => it.removeLabelViews());
        (this.svgElement as any).clear();
        this.children = null;
        this.children.map(it => it.render(this.svgElement));
    }

    removeLabelViews() {
        this.children.map(it => it.removeLabelViews());
    }

    remove() {
        this.children.map(it => it.removeLabelViews());
        this.svgElement.node.remove();
    }

    layoutLabelRenderContext() {
        this.children.map(it => it.layoutLabelRenderContext());
    }

    layoutLabelsRenderContextAfterSelf() {
        let next: TextElement = this;
        while (next.next && next.next.svgElement) {
            next.next.layoutLabelRenderContext();
            next = next.next;
        }
        if (next.parent instanceof TextElement)
            next.parent.layoutLabelsRenderContextAfterSelf();
    }
}