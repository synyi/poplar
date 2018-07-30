import {Renderable} from "../../Interface/Renderable";
import * as SVG from "svg.js";
import {SoftLineTopRenderContext} from "../SoftLineTopRenderContext";

export abstract class SoftLineMarginTopPlaceUser implements Renderable {
    svgElement: SVG.Element;

    layer = 1;
    private overLappingEliminated = false;

    protected constructor(protected context: SoftLineTopRenderContext) {
    }

    abstract get x(): number;

    abstract get width(): number;

    private get overlapping() {
        let allElementsInThisLayer = this.context.elements.filter(it =>
            it.overLappingEliminated && it.layer === this.layer
        );
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

    abstract render(context: SVG.Element);

    abstract rerender();

    public eliminateOverLapping() {
        while (this.overlapping) {
            ++this.layer;
        }
        this.overLappingEliminated = true;
    }
}