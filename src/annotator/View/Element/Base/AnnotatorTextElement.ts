import {Store} from "../../../Store/Store";
import {Paragraph} from "../../../Store/Paragraph";
import {Sentence} from "../../../Store/Sentence";
import {AnnotatorElement} from "./AnnotatorElement";
import {Label} from "../../../Store/Label";

export abstract class AnnotatorTextElement extends AnnotatorElement {
    protected parent: AnnotatorTextElement;
    protected _next: AnnotatorTextElement;

    protected constructor(store: Label | Sentence | Paragraph | Store, parent: AnnotatorTextElement = null) {
        super(store);
        this.parent = parent;
    }

    get next() {
        if (this._next) {
            return this._next;
        }
        try {
            return ((this.svgElement.node.nextElementSibling as any).instance as any).AnnotatorTextElement;
        } catch (e) {
            return null;
        }
    }

    set next(value) {
        this._next = value;
    }

    get ancestor() {
        return this.parent === null ? this : this.parent.ancestor;
    }

    get ancestorStore(): Store {
        return this.ancestor.store;
    }

    abstract layoutLabelsRenderContextAfterSelf()

    abstract layoutLabelRenderContext()
}