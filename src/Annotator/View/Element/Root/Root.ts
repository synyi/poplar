import {TreeNode} from "../../../Public/Base/TreeNode";
import * as SVG from "svg.js";
import {Store} from "../../../Store/Store";
import {TextBlock} from "../TextBlock";
import {Paragraph} from "../../../Store/Paragraph";
import {RenderBehaviour} from "./RenderBehaviour/RenderBehaviour";
import {fromEvent, Observable} from "rxjs";
import {EventEmitter} from "events";

export class Root extends TreeNode {
    svgElement: SVG.Text;

    static eventEmitter = new EventEmitter();

    static sizeChanged$: Observable<null> = fromEvent(Root.eventEmitter, 'sizeChanged');

    constructor(private store: Store, public renderBehaviour: RenderBehaviour) {
        super();
    }

    _children: Array<TextBlock>;

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
        this.svgElement = context.text('');
        this.renderBehaviour.render(this.children, this.svgElement);
    }
}