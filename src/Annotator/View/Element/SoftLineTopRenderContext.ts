import {Renderable} from "../Interface/Renderable";
import * as SVG from "svg.js";
import {SoftLine} from "./SoftLine";
import {SoftLineTopPlaceUser} from "./Base/SoftLineTopPlaceUser";


export class SoftLineTopRenderContext implements Renderable {
    svgElement: SVG.G;
    private lastHeight = 0;

    constructor(public attachToLine: SoftLine,
                public elements: Array<SoftLineTopPlaceUser> = []) {
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
            this.elements.map(it => it.eliminateOverLapping());
            this.elements.map(it => it.render());
            this.layout();
        }
    }

    rerender() {
        if (this.svgElement)
            this.svgElement.clear();
        if (this.elements.length !== 0) {
            this.elements.map(it => it.eliminateOverLapping());
            this.elements.map(it => it.render());
            this.layout();
        }
    }

    layout() {
        if (this.svgElement) {
            this.attachToLine.svgElement.dy(this.height + 20.8);
            let originY = (this.attachToLine.svgElement.node as any).getExtentOfChar(0).y;
            this.svgElement.y(originY - 5);

            if (this.lastHeight !== this.height) {
                this.attachToLine.layoutAfterSelf();
                this.lastHeight = this.height;
            }
        }
    }

    remove() {
        if (this.svgElement) {
            this.elements = [];
            this.svgElement.clear();
        }
    }
}