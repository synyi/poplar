import * as SVG from "svg.js";
import {LineView} from "./LineView";
import {TopContextUser} from "./TopContextUser";
import {EventEmitter} from "events";
import {fromEvent, Observable} from "rxjs";

export class TopContext {
    svgElement: SVG.G;

    elements: Set<TopContextUser>;

    positionChanged$: Observable<void>;
    private eventEmitter = new EventEmitter();

    constructor(public readonly attachTo: LineView.Entity) {
        this.elements = new Set<TopContextUser>();
        this.positionChanged$ = fromEvent(this.eventEmitter, 'positionChanged');
    }

    get height() {
        let maxLayer = 0;
        for (let it of this.elements) {
            if (it.layer > maxLayer) {
                maxLayer = it.layer;
            }
        }
        return maxLayer * 30;
    }

    get globalY(): number {
        return this.svgElement.rbox(this.svgElement.doc()).y;
    }

    render(context: SVG.Doc) {
        this.svgElement = context.group().back();
        this.layout(null);

        [...this.elements].forEach(it => it.render());
    }

    removeElement() {
        this.svgElement.remove();
    }

    layout(dy: number) {
        if (dy === null) {
            let originY = (this.attachTo.svgElement.node as any).getExtentOfChar(0).y;
            this.svgElement.y(originY);
        } else {
            this.svgElement.y(this.svgElement.y() + dy);
        }
        this.eventEmitter.emit('positionChanged');
    }
}
