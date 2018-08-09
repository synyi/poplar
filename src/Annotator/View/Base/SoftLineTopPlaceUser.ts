import * as SVG from "svg.js";
import {Destructable} from "../../Common/Base/Destructable";
import {SoftLineTopRenderContext} from "../Element/SoftLineTopRenderContext";

export abstract class SoftLineTopPlaceUser extends Destructable {
    svgElement: SVG.Element = null;
    layer = null;
    abstract readyToRender: Boolean;
    abstract readonly initialLayer;

    protected constructor(public context: SoftLineTopRenderContext) {
        super();
    }

    get rendered(): Boolean {
        return this.svgElement !== null;
    }

    abstract get x(): number;

    abstract get width(): number;

    private get overlapping() {
        let allElementsInThisLayer = new Set();
        for (let ele of this.context.elements) {
            if (ele !== this && ele.layer === this.layer) {
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

    abstract _render(context: SVG.G);

    render(context: SVG.G) {
        this.eliminateOverlapping();
        this._render(context);
    }

    _destructor() {
        this.layer = null;
        // 出于性能原因，不自行移除 svgElement，而由 context 统一移除
        // this.svgElement.remove();
        this.svgElement = null;
        this.context.elements.delete(this);
    }

    private eliminateOverlapping() {
        this.layer = this.initialLayer;
        while (this.overlapping) {
            ++this.layer;
        }
    }
}