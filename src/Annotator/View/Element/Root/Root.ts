import * as SVG from "svg.js";
import {Store} from "../../../Store/Store";
import {TextBlock} from "../TextBlock";
import {fromEvent, Observable} from "rxjs";
import {TreeNode} from "../../../Common/Base/TreeNode";
import {Paragraph} from "../../../Store/Element/Paragraph";
import {RenderBehaviour} from "./RenderBehaviour/RenderBehaviour";
import {assert} from "../../../Common/Tools/Assert";
import {Connection} from "../../../Store/Element/Connection/Connection";
import {ConnectionView} from "../Connection/ConnectionView";

export class Root extends TreeNode {
    svgElement: SVG.Text = null;

    sizeChanged$: Observable<null> = fromEvent(this, 'sizeChanged');
    _children: Array<TextBlock> = null;

    constructor(private store: Store, public renderBehaviour: RenderBehaviour) {
        super();
        Connection.all.forEach(it => new ConnectionView(it));
        Store.connectionAdded$.subscribe(it => new ConnectionView(it));
    }

    get children(): Array<TextBlock> {
        if (this._children === null) {
            this._children = this.store.children.map((paragraph: Paragraph) => {
                return new TextBlock(paragraph, this);
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

    render(context: SVG.Doc) {
        assert(this.svgElement === null);
        this.svgElement = context.text('');
        this.renderBehaviour.render(this.children, this.svgElement);
    }
}