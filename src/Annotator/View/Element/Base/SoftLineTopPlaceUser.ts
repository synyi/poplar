import * as SVG from "svg.js";
import {SoftLineTopRenderContext} from "../SoftLineTopRenderContext";
import {fromEvent, Observable} from "rxjs";
import {Destroyable} from "../../../Public/Interface/Destroyable";
import {EventEmitter} from "events";

export abstract class SoftLineTopPlaceUser extends EventEmitter implements Destroyable {
    svgElement: SVG.Element = null;
    layer = 1;

    destructed$: Observable<SoftLineTopPlaceUser> = null;

    protected overLappingEliminated = false;

    protected constructor(public context: SoftLineTopRenderContext) {
        super();
        this.destructed$ = fromEvent(this, 'destructed');
    }

    abstract get x(): number;

    abstract get width(): number;

    protected get overlapping() {
        let allElementsInThisLayer = new Set();
        for (let ele of this.context.elements) {
            if (ele !== this && ele.overLappingEliminated && ele.layer === this.layer) {
                allElementsInThisLayer.add(ele);
            }
        }
        let thisLeftX = this.x;
        let width = this.width;
        for (let other of allElementsInThisLayer) {
            let thisRightX = thisLeftX + width;
            let otherLeftX = other.x;
            let otherWidth = other.width;
            let otherRightX = otherLeftX + otherWidth;
            if ((thisLeftX <= otherLeftX && otherLeftX <= thisRightX) ||
                (thisLeftX <= otherRightX && otherRightX <= thisRightX) ||
                (thisLeftX <= otherLeftX && otherRightX <= thisRightX) ||
                (otherLeftX <= thisLeftX && thisRightX <= otherRightX)) {
                return true;
            }
        }
        return false;
    }

    abstract render(context: SVG.G);

    public eliminateOverLapping() {
        while (this.overlapping) {
            ++this.layer;
        }
        this.overLappingEliminated = true;
    }

    destructor() {
        this.layer = -1;
        // 出于性能原因，不自行移除 svgElement，而由 context 统一移除
        // this.svgElement.remove();
        this.svgElement = null;
        this.emit('destructed');
    }
}