import {Renderable} from "../Interface/Renderable";
import * as SVG from "svg.js";
import {fromEvent, Observable} from "rxjs";
import {EventEmitter} from "events";
import {Destroyable} from "../../Public/Interface/Destroyable";
import {SoftLineTopPlaceUser} from "./Base/SoftLineTopPlaceUser";
import {assert} from "../../Tools/Assert";
import {SoftLine} from "./SoftLine";

export class SoftLineTopRenderContext extends EventEmitter implements Renderable, Destroyable {
    svgElement: SVG.G = null;
    heightChanged$: Observable<SoftLineTopRenderContext> = null;
    elements: Set<SoftLineTopPlaceUser> = null;

    constructor(private attachToLine: SoftLine) {
        super();
        this.elements = new Set<SoftLineTopPlaceUser>();
        this.heightChanged$ = fromEvent(this, 'heightChanged');
    }

    get height() {
        let maxLayer = 0;
        for (let element of this.elements) {
            element.eliminateOverLapping();
            if (maxLayer < element.layer) {
                maxLayer = element.layer;
            }
        }
        return maxLayer * 30;
    }

    render(context: SVG.Doc) {
        this.svgElement = context.group().back();
        this.elements.forEach(it => it.eliminateOverLapping());
        this.elements.forEach(it => it.render(this.svgElement));
        this.emit('heightChanged', this);
    }

    rerender() {
        assert(this.svgElement !== null);
        let oldHeight = this.height;
        this.elements.forEach(it => it.eliminateOverLapping());
        this.elements.forEach(it => it.render(this.svgElement));
        if (oldHeight !== this.height) {
            this.emit('heightChanged', this);
        }
    }

    layout() {
        if (this.svgElement) {
            let originY = (this.attachToLine.svgElement.node as any).getExtentOfChar(0).y;
            this.svgElement.y(originY - 5);
        }
    }

    addElement(element: SoftLineTopPlaceUser) {
        element.destructed$.subscribe(() => this.rerender());
        this.elements.add(element);
    }

    destructor() {
        this.elements.forEach(it => it.destructor());
        this.elements = null;
        if (this.svgElement) {
            this.svgElement.remove();
        }
        this.svgElement = null;
        this.heightChanged$ = null;
    }
}