import {Store} from "../Store/Store";
import * as SVG from "svg.js";
import {Root} from "./Element/Root/Root";
import {RenderBehaviour} from "./Element/Root/RenderBehaviour/RenderBehaviour";

export class View {
    root: Root;
    width: number;
    height: number;
    svgElement: SVG.Doc;

    constructor(store: Store,
                svgElement: HTMLElement,
                renderBehaviour: RenderBehaviour) {
        this.root = new Root(store, renderBehaviour);
        this.svgElement = SVG(svgElement);
        this.svgElement.size(1024, 768);
        this.root.render(this.svgElement);
    }
}