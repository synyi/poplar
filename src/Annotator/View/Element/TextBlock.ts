import * as SVG from "svg.js";
import {TextElement} from "../Base/TextElement";
import {Paragraph} from "../../Store/Element/Paragraph";
import {first} from "rxjs/operators";
import {Root} from "./Root/Root";
import {HardLine} from "./HardLine";
import {Sentence} from "../../Store/Element/Sentence";
import {Subscription} from "rxjs";
import {assert} from "../../Common/Tools/Assert";

export class TextBlock extends TextElement {
    svgElement: SVG.Tspan;
    parent: Root/*=null;*/;
    storeTextChangedSubscription: Subscription = null;

    constructor(public store: Paragraph,
                parent: Root) {
        super(parent);
        this.store.destructed$.pipe(first())
            .subscribe(() => this.destructor());
        this.storeTextChangedSubscription = this.store.textChanged$
            .subscribe(() => this.rerender());
    }

    _children: Array<HardLine> = null;

    get children(): Array<HardLine> {
        if (this._children === null) {
            this._children = this.makeHardLines();
        }
        return this._children;
    }

    render(context: SVG.Text) {
        assert(this.svgElement === null);
        this.svgElement = context.tspan('');
        this.children.map(it => it.render(this.svgElement));
    }

    set children(value) {
        this._children = value;
    }

    _destructor() {
        this.svgElement.node.remove();
        this.store = null;
        this.storeTextChangedSubscription.unsubscribe();
        this.storeTextChangedSubscription = null;
        super._destructor();
    }

    layoutAfterSelf() {
        super.layoutAfterSelf();
        if (this.nextNode === null) {
            this.parent.emit('sizeChanged');
        }
    }

    private makeHardLines(): Array<HardLine> {
        let result = this.store.children.map((sentence: Sentence) => {
            return new HardLine(sentence, this);
        });
        for (let i = 0; i < result.length - 1; ++i) {
            result[i].nextNode = result[i + 1];
        }
        return result;
    }

    private rerender() {
        this.children.forEach(it => it.destructor());
        this.svgElement.clear();
        this.children = this.makeHardLines();
        this.children.forEach(it => it.render(this.svgElement));
    }
}