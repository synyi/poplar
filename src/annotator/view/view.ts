import {svgjs} from 'svg.js'
import {Store} from "../Store/Store";
import {Root} from "./Elements/Root";

declare var SVG: svgjs.Library;

export class View {
    private root: Root;
    private svgDoc: any;

    constructor(
        private store: Store,
        private svgElement: HTMLElement,
        private width: number,
        private height: number
    ) {
        this.svgDoc = SVG(svgElement);
        (svgElement as any).svgInstance = this.svgDoc;
        this.svgDoc.size(width, height);
        this.root = new Root(store);
        this.root.render(this.svgDoc);
    }
}