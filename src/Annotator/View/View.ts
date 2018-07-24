import {Store} from "../Store/Store";
import {Root} from "./Element/Root";
import * as SVG from "svg.js";

export class View {
    root: Root;

    constructor(store: Store,
                svgElement: HTMLElement) {
        this.root = new Root(store);
        let svgDoc = SVG(svgElement);
        this.root.render(svgDoc);
        svgDoc.size(this.root.svgElement.node.scrollWidth + 20, this.root.svgElement.node.getBoundingClientRect().height + 20);
        console.log(this.root);
    }
}