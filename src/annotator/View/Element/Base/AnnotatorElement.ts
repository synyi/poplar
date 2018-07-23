import * as SVG from "svg.js";
import {Label} from "../../../Store/Label";
import {Sentence} from "../../../Store/Sentence";
import {Paragraph} from "../../../Store/Paragraph";
import {Store} from "../../../Store/Store";

export abstract class AnnotatorElement {
    protected constructor(store: Label | Sentence | Paragraph | Store) {
        this.store = store;
    }

    protected svgElement: SVG.Element;

    protected store: Label | Sentence | Paragraph | Store;

    abstract render(context: any);

    abstract remove();

    get rendered() {
        return this.svgElement;
    }
}