import {Store} from "../Store/Store";
import {RenderBehaviour} from "./Element/Root/RenderBehaviour/RenderBehaviour";
import {Root} from "./Element/Root/Root";
import * as SVG from "svg.js";

export class View {
    root: Root = null;
    svgElement: SVG.Doc;

    constructor(
        store: Store,
        htmlElement: HTMLElement,
        renderBehaviour: RenderBehaviour
    ) {
        this.root = new Root(store, renderBehaviour);
        this.svgElement = SVG(htmlElement);
        this.svgElement.size(1024, 768);
        this.root.render(this.svgElement);
        this.svgElement.size(this.root.svgElement.bbox().width + 50, this.root.svgElement.bbox().h + this.svgElement.select('g:first-child').bbox().height + 50);
        this.root.sizeChanged$.subscribe(() => {
            this.svgElement.size(this.root.svgElement.bbox().width + 50, this.root.svgElement.bbox().h + this.svgElement.select('g:first-child').bbox().height + 50);
        });
    }
}