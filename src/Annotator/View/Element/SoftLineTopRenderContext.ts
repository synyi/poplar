import {Renderable} from "../Interface/Renderable";
import * as SVG from "svg.js";
import {SoftLine} from "./SoftLine";
import {SoftLineMarginTopPlaceUser} from "./Base/SoftLineMarginTopPlaceUser";

export class SoftLineTopRenderContext implements Renderable {
    svgElement: SVG.G;

    constructor(public attachToLine: SoftLine,
                public elements: Array<SoftLineMarginTopPlaceUser> = []) {
    }

    get height() {
        if (this.elements.length === 0) {
            return 0;
        }
        this.elements.map(it => it.eliminateOverLapping());
        return Math.max(...this.elements.map(it => it.layer)) * 30;
    }

    render(context: SVG.Doc) {
        if (this.elements.length !== 0) {
            this.svgElement = context.group().back();
            this.elements.map(it => it.render());
            this.layout();
        }
    }

    rerender() {
        if (this.elements.length !== 0) {
            this.svgElement.clear();
            this.elements.map(it => it.eliminateOverLapping());
            this.elements.map(it => it.render());
            this.layout();
        }
    }

    layout() {
        if (this.elements.length !== 0) {
            let originY = (this.attachToLine.svgElement.node as any).getExtentOfChar(0).y;
            this.svgElement.y(originY - 5);
        }
    }
}