import {TextElement} from "./Base/TextElement";
import * as SVG from "svg.js";
import {of, Subscription} from "rxjs";
import {Paragraph} from "../../Store/Paragraph";
import {HardLine} from "./HardLine";
import {Sentence} from "../../Store/Sentence";
import {Root} from "./Root/Root";

export class TextBlock extends TextElement {
    storeAfterDestructSubscription: Subscription = null;

    constructor(public store: Paragraph,
                public parent: Root) {
        super(parent);
        this.storeAfterDestructSubscription = this.store.afterDestruct$.subscribe(() => this.destructor());
        this.constructed$ = of(this);
    }

    _children: Array<HardLine> = null;

    get children(): Array<HardLine> {
        if (this._children === null) {
            this._children = this.store.children.map((sentence: Sentence) => {
                return new HardLine(sentence, this);
            });
            for (let i = 0; i < this._children.length - 1; ++i) {
                this._children[i].nextNode = this._children[i + 1];
            }
        }
        return this._children;
    }

    set children(value) {
        this._children = value;
    }

    _render(context: SVG.Text) {
        this.svgElement = context.tspan('');
        this.children.map(it => it.render(this.svgElement));
    }

    _destructor() {
        this.svgElement.node.remove();
        this.storeAfterDestructSubscription.unsubscribe();
    }

    layoutAfterSelf() {
        super.layoutAfterSelf();
        if (this.nextNode === null) {
            Root.eventEmitter.emit('sizeChanged');
        }
    }
}