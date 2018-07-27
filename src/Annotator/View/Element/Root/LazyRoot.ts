import * as SVG from "svg.js";
import {Store} from "../../../Store/Store";
import {Root} from "./Root";

const PAGE_SIZE = 10;

export class LazyRoot extends Root {
    nextRenderIndex = 0;

    constructor(store: Store) {
        super(store);
    }

    render(context: SVG.Doc) {
        let pageSize = PAGE_SIZE;
        if (!this.svgElement) {
            this.svgElement = context.text('').dx(10);
            (this.svgElement as any).AnnotatorElement = this;
            pageSize = 20;
        }
        this.svgElement.build(true);
        if (this.nextRenderIndex !== 0) {
            this.children[this.nextRenderIndex - 1].next = this.children[this.nextRenderIndex];
        }
        let nextRenderContents = this.children.slice(this.nextRenderIndex, this.nextRenderIndex + pageSize);
        nextRenderContents[nextRenderContents.length - 1].next = null;
        nextRenderContents.map(it => it.render(this.svgElement));
        this.nextRenderIndex += nextRenderContents.length;
        this.svgElement.build(false);
    }

    rerender() {
        this.svgElement.clear();
        this._children = null;
        this.children.map(it => it.rerender());
    }
}