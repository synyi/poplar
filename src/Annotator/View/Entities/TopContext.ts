import * as SVG from "svg.js";

export interface TopContextUser {
    layer: number;

    eliminateOverlapping();

    render();

    delete();
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
