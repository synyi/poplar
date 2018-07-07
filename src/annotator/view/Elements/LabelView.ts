import {AnnotationElementBase} from "./AnnotationElementBase";
import {Label} from "../../Store/Label";
import {SoftLine} from "./SoftLine";

export class LabelView implements AnnotationElementBase {
    correspondingStore: Label;
    svgElement: any;

    constructor(correspondingStore: Label, private attachedToLine: SoftLine) {
        this.correspondingStore = correspondingStore;
        this.attachedToLine.labels.push(this);
    }

    transplantTo(newLine: SoftLine) {
        this.attachedToLine.labels.splice(this.attachedToLine.labels.indexOf(this));
        this.attachedToLine = newLine;
        this.attachedToLine.labels.push(this);
        this.rerender();
    }

    // Thanks to Alex Hornbake (function for generate curly bracket path)
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

    layout() {
        let store = this.attachedToLine.correspondingStore;
        let firstIndexInSoftLine = store.toLocalIndex(this.correspondingStore.startIndexInRawContent) - this.attachedToLine.startIndexInHard;
        let left = this.attachedToLine.svgElement.node.getExtentOfChar(firstIndexInSoftLine);
        this.svgElement.x(left.x).y(left.y);
    }

    render() {
        let svgDrawingContext = this.attachedToLine.labelDrawingContext;
        this.attachedToLine.updateMarginTopRowsCount();
        let store = this.attachedToLine.correspondingStore;
        let firstIndexInSoftLine = store.toLocalIndex(this.correspondingStore.startIndexInRawContent) - this.attachedToLine.startIndexInHard;
        let lastIndexInSoftLine = store.toLocalIndex(this.correspondingStore.endIndexInRawContent) - this.attachedToLine.startIndexInHard;
        if (firstIndexInSoftLine < 0) return;
        let left = this.attachedToLine.svgElement.node.getExtentOfChar(firstIndexInSoftLine);
        let right = this.attachedToLine.svgElement.node.getExtentOfChar(lastIndexInSoftLine);
        // fix bug on selecting the last character
        if (right.x === 0) {
            let right = this.attachedToLine.svgElement.node.getExtentOfChar(lastIndexInSoftLine - 1);
            right.x += right.width;
        }
        this.svgElement = svgDrawingContext.group().back();
        this.svgElement.rect(right.x - left.x, right.height).fill('#ff9b8e');
        this.bracket(0, -left.height + 9, right.x - left.x, -left.height + 8, 10);
        this.svgElement.rect(12 * this.correspondingStore.toString().length + 6, 17).radius(3, 3)
            .fill({
                color: '#f06',
                opacity: 0.25
            })
            .stroke('#9a003e').dy(-left.height - 10).dx((right.x - left.x) / 2 - 12 * this.correspondingStore.toString().length / 2 - 3);
        this.svgElement.text(this.correspondingStore.toString()).font({size: 12}).dy(-left.height - 13).dx((right.x - left.x) / 2 - 12 * this.correspondingStore.toString().length / 2);
        this.layout();
    }

    rerender() {
        this.render();
    }

    remove() {
        this.svgElement.remove();
    }
}