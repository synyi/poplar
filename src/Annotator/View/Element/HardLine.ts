import {TextElement} from "../Base/TextElement";
import * as SVG from "svg.js";
import {TextBlock} from "./TextBlock";
import {Sentence} from "../../Store/Element/Sentence";
import {Subscription} from "rxjs";
import {filter, first} from "rxjs/operators";
import {SoftLine} from "./SoftLine";
import {Label} from "../../Store/Element/Label/Label";
import {assert} from "../../Common/Tools/Assert";
import {Store} from "../../Store/Store";


export class HardLine extends TextElement {
    svgElement: SVG.Tspan/* = null; in base*/;
    parent: TextBlock/*=null; in base*/;
    storeTextChangedSubscription: Subscription = null;

    constructor(public store: Sentence,
                parent: TextBlock) {
        super(parent);
        this.store.destructed$.pipe(first())
            .subscribe(() => this.destructor());
        this.storeTextChangedSubscription = this.store.textChanged$
            .subscribe(() => this.rerender());
        Store.labelAdded$.pipe(
            filter((label: Label) => {
                return this.store.globalStartIndex <= label.startIndex && label.endIndex <= this.store.globalEndIndex;
            }),
            filter((label: Label) => {
                for (let softline of this.children) {
                    if (softline.globalStartIndex <= label.startIndex && label.endIndex <= softline.globalEndIndex) {
                        return false;
                    }
                }
                return true;
            })).subscribe(() => this.rerender());
    }

    _children: Array<SoftLine> = null;

    get children(): Array<SoftLine> {
        if (this._children === null) {
            this._children = this.makeSoftLines();
        }
        return this._children;
    }

    render(context: SVG.Tspan) {
        assert(this.svgElement === null);
        this.svgElement = context.tspan('');
        this.children.map(it => it.render(this.svgElement));
    }

    set children(value: Array<SoftLine>) {
        this._children = value;
    }

    _destructor() {
        this.svgElement.node.remove();
        this.storeTextChangedSubscription.unsubscribe();
        super._destructor();
    }

    private makeSoftLines(): Array<SoftLine> {
        let result = [];
        let startIndex = 0;
        while (startIndex < this.store.length) {
            let endIndex = startIndex + SoftLine.maxWidth;
            if (endIndex > this.store.length) {
                endIndex = this.store.length;
            }
            let crossLabel = Label.getFirstLabelCross(this.store.globalStartIndex + endIndex);
            while (crossLabel) {
                endIndex = crossLabel.endIndex - this.store.globalStartIndex;
                crossLabel = Label.getFirstLabelCross(this.store.globalStartIndex + endIndex);
            }
            if (startIndex < endIndex) {
                let newSoftline = new SoftLine(this, startIndex, endIndex);
                result.push(newSoftline);
            }
            if (startIndex == endIndex) {
                throw RangeError("startIndex should never equals to endIndex in makeSoftLines!");
            }
            startIndex = endIndex;
        }
        for (let i = 0; i < result.length - 1; ++i) {
            result[i].nextNode = result[i + 1];
        }
        return result;
    }

    private rerender() {
        while (this.children.length !== 0) {
            this.children[0].destructor();
        }
        this.svgElement.clear();
        this.children = this.makeSoftLines();
        this.children.map(it => it.render(this.svgElement));
        this.layout(-1);
        this.layoutAfterSelf(-1);
    }
}