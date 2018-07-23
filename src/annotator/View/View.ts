import {Store} from "../Store/Store";
import {Root} from "./Element/Root";
import * as SVG from "svg.js";

export class View {
    root: Root;

    constructor(store: Store,
                svgElement: HTMLElement,
                width: number, height: number) {
        this.root = new Root(store);
        let svgDoc = SVG(svgElement);
        svgDoc.size(width, height);
        this.root.render(svgDoc);
        console.log(this.root);
    }
}