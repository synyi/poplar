import * as SVG from "svg.js";

export abstract class TopContextUser {
    layer: number;

    context: TopContext;

    abstract readonly x: number;

    abstract readonly width: number;
    svgElement: SVG.Element;

    get y() {
        return -30 * (this.layer - 1);
    }

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

    eliminateOverlapping() {
        while (this.overlapping) {
            ++this.layer;
        }
    }

    abstract render();

    abstract delete();
}

export class TopContext {
    svgElement: SVG.G;

    elements: Set<TopContextUser>;

    constructor(public readonly attachTo) {
        this.elements = new Set<TopContextUser>();
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

    render(context: SVG.Doc) {
        this.svgElement = context.group().back();
        this.layout(null);
        this.elements.forEach(it => it.render());
    }

    delete() {
        for (let it of this.elements) {
            it.delete();
        }
        this.elements.clear();
        this.svgElement.remove();
    }

    layout(dy: number) {
        if (dy === null) {
            let originY = (this.attachTo.svgElement.node as any).getExtentOfChar(0).y;
            this.svgElement.y(originY);
        } else {
            this.svgElement.y(this.svgElement.y() + dy);
        }
    }
}
