import {Renderable} from "../../Interface/Renderable";
import * as SVG from "svg.js";
import {Store} from "../../../Store/Store";
import {Root} from "./Root";

export class OneShotRoot extends Root implements Renderable {
    svgElement: SVG.Text;

    constructor(store: Store) {
        super(store);
    }

    render(context: SVG.Doc) {
        this.svgElement = context.text('').dx(10);
        (this.svgElement as any).AnnotatorElement = this;
        this.svgElement.build(true);
        this.children.map(it => it.render(this.svgElement));
        this.svgElement.build(false);
    }

    rerender() {
        this.svgElement.clear();
        this._children = null;
        this.children.map(it => it.rerender());
    }
}