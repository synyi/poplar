import { Root } from "./Elements/Root";
export class View {
    constructor(store, svgElement, width, height) {
        this.store = store;
        this.svgElement = svgElement;
        this.width = width;
        this.height = height;
        this.svgDoc = SVG(svgElement);
        svgElement.svgInstance = this.svgDoc;
        this.svgDoc.size(width, height);
        this.root = new Root(store);
        this.root.render(this.svgDoc);
    }
}
