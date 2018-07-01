import {AnnotationElementBase} from "./AnnotationElementBase";
import {Label} from "../../Store/Label";
import {G} from "svg.js";
import {SoftLine} from "./SoftLine";

export class LabelView implements AnnotationElementBase {
    correspondingStore: Label;
    svgElement: G;

    constructor(correspondingStore: Label, private  attachedToLine: SoftLine) {
        this.correspondingStore = correspondingStore;
        this.attachedToLine.labels.push(this);
    }

    // Thanks to Alex Hornbake (function for generate curly bracket path)

    render(svgDoc: any) {
        // console.log("Rendering Label", this);
        this.attachedToLine.requireMoreMarginTopRows();
        let svgInstance = ((this.attachedToLine.svgElement.node as HTMLElement).parentElement.parentElement.parentElement.parentElement.parentElement as any).svgInstance;
        let left = this.attachedToLine.svgElement.node.getExtentOfChar(this.correspondingStore.startIndex - this.attachedToLine.startIndexInHard);
        let right = this.attachedToLine.svgElement.node.getExtentOfChar(this.correspondingStore.endIndex - this.attachedToLine.startIndexInHard);
        this.svgElement = svgInstance.group().dx(left.x).dy(left.y).back();
        this.svgElement.rect(right.x - left.x, right.height).fill('#ff9b8e');
        this.bracket(0, -left.height + 9, right.x - left.x, -left.height + 8, 10);
        this.svgElement.rect(12 * this.correspondingStore.toString().length + 6, 17).radius(3, 3)
            .fill({
                color: '#f06',
                opacity: 0.25
            })
            .stroke('#9a003e').dy(-left.height - 10).dx((right.x - left.x) / 2 - 12 * this.correspondingStore.toString().length / 2 - 3);
        this.svgElement.text(this.correspondingStore.toString()).font({size: 12}).dy(-left.height - 13).dx((right.x - left.x) / 2 - 12 * this.correspondingStore.toString().length / 2);
    }

    rerender() {
    }

    // http://bl.ocks.org/alexhornbake/6005176
    private bracket(x1, y1, x2, y2, width, q = 0.6) {
        //Calculate unit vector
        let dx = x1 - x2;
        let dy = y1 - y2;
        let len = Math.sqrt(dx * dx + dy * dy);
        dx = dx / len;
        dy = dy / len;

        //Calculate Control Points of path,
        let qx1 = x1 + q * width * dy;
        let qy1 = y1 - q * width * dx;
        let qx2 = (x1 - .25 * len * dx) + (1 - q) * width * dy;
        let qy2 = (y1 - .25 * len * dy) - (1 - q) * width * dx;
        let tx1 = (x1 - .5 * len * dx) + width * dy;
        let ty1 = (y1 - .5 * len * dy) - width * dx;
        let qx3 = x2 + q * width * dy;
        let qy3 = y2 - q * width * dx;
        let qx4 = (x1 - .75 * len * dx) + (1 - q) * width * dy;
        let qy4 = (y1 - .75 * len * dy) - (1 - q) * width * dx;
        return this.svgElement.path(`M${x1},${y1}Q${qx1},${qy1},${qx2},${qy2}T${tx1},${ty1}M${x2},${y2}Q${qx3},${qy3},${qx4},${qy4}T${tx1},${ty1}`)
            .fill('none').stroke({color: '#f06', width: 1}).transform({rotation: 180});
    }

}