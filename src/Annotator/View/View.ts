import {Store} from "../Store/Store";
import * as SVG from "svg.js";
import {Root} from "./Element/Root/Root";
import {RenderBehaviour} from "./Element/Root/RenderBehaviour/RenderBehaviour";

export class View {
    root: Root;
    svgElement: SVG.Doc;

    constructor(store: Store,
                svgElement: HTMLElement,
                renderBehaviour: RenderBehaviour) {
        this.root = new Root(store, renderBehaviour);
        this.svgElement = SVG(svgElement);
        this.svgElement.size(1024, 768);
        this.root.render(this.svgElement);
        this.svgElement.width(this.root.svgElement.rbox().width + 50);
        this.svgElement.height(this.root.svgElement.rbox().height + 50);
        Root.sizeChanged$.subscribe(() => {
            console.log(this.root.svgElement.rbox());
            this.svgElement.width();
            this.svgElement.height();
        });
    }
}