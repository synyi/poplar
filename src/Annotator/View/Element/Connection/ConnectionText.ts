import {SoftLineTopPlaceUser} from "../../Base/SoftLineTopPlaceUser";
import * as SVG from "svg.js";
import {assert} from "../../../Common/Tools/Assert";
import {SoftLineTopRenderContext} from "../SoftLineTopRenderContext";
import {first} from "rxjs/operators";
import {ConnectionView} from "./ConnectionView";
import {LabelView} from "../LabelView";
import {fromEvent, merge, Observable, zip} from "rxjs";
import {DeleteConnectionAction} from "../../../Action/DeleteConnectionAction";

export class ConnectionText extends SoftLineTopPlaceUser {
    svgElement: SVG.G;
    textElement: SVG.Text = null;
    context: SoftLineTopRenderContext = null;
    rendered$: Observable<null> = fromEvent(this, 'rendered');

    constructor(public parent: ConnectionView) {
        super(parent.higher.view.context);
        let readyToRender$: Observable<any>;
        if (this.from.rendered && this.to.rendered) {
            this.context = this.parent.higher.view.context;
            this.context.addElement(this);
            this.context.renderUnrendered();
        } else if (this.from.rendered) {
            readyToRender$ = this.to.xCoordinateChanged$.pipe(first());
        } else if (this.to.rendered) {
            readyToRender$ = this.from.xCoordinateChanged$.pipe(first());
        } else {
            readyToRender$ = zip(this.from.xCoordinateChanged$, this.to.xCoordinateChanged$).pipe(first());
        }
        if (!(this.from.rendered && this.to.rendered))
            readyToRender$.subscribe(() => {
                assert(this.readyToRender === true);
                this.context = this.parent.higher.view.context;
                this.context.addElement(this);
                // not in same line
                if (this.from.context !== this.to.context)
                    this.context.renderUnrendered();
                // else, SoftLineTopRenderContext will handle this
            });
        merge(this.from.destructed$, this.to.destructed$).subscribe(() => this.destructor());
    }

    get from(): LabelView {
        return this.parent.from.view;
    }


    get to(): LabelView {
        return this.parent.to.view;
    }


    get initialLayer() {
        assert(this.from !== null && this.to !== null);
        return this.context === this.from.context ? this.from.layer + 1 : this.to.layer + 1;
    }

    get width(): number {
        if (!this.textElement) {
            this.textElement = this.context.svgElement.text(this.parent.store.text).size(12);
        }
        return this.textElement.node.clientWidth;
    }

    get x(): number {
        let leftMost = this.from.x < this.to.x ? this.from.x : this.to.x;
        let rightMost = this.from.x + this.from.width;
        if (rightMost < this.to.x + this.to.width) {
            rightMost = this.to.x + this.to.width;
        }
        return (leftMost + rightMost - this.width) / 2;
    }

    get y(): number {
        return (this.layer) * -30 + 20.8;
    }

    get readyToRender(): boolean {
        return this.from !== null && this.to !== null;
    }

    _render(context: SVG.G) {
        this.svgElement = this.context.svgElement.group().back();
        assert(this.textElement !== null);
        this.svgElement.rect(this.width, 12).fill('white');
        this.svgElement.put(this.textElement);
        this.textElement.y(0);
        this.svgElement.x(this.x).y(this.y - 6);
        this.svgElement.node.oncontextmenu = (e) => {
            DeleteConnectionAction.emit(this.parent.store);
            this.parent.destructor();
        }
    }

    render(context: SVG.G) {
        super.render(context);
        this.emit('rendered');
    }

    _destructor() {
        this.svgElement.remove();
    }
}