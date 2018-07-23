import {AnnotatorElement} from "./Base/AnnotatorElement";
import * as SVG from "svg.js";
import {Label} from "../../Store/Label";
import {SoftLine} from "./SoftLine";

const AnnotationTextSize = 12;
const AnnotationTextContainerPadding = 3;


export class LabelView extends AnnotatorElement {
    protected svgElement: SVG.G;
    private annotationElement: SVG.Rect;
    private textElement: SVG.G;
    public store: Label;
    public layer = 1;
    private overLappingEliminated = false;

    constructor(store: Label,
                private attachToSoftLine: SoftLine) {
        super(store);
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
        return this.textElement.path(`M${x1},${y1}Q${qx1},${qy1},${qx2},${qy2}T${tx1},${ty1}M${x2},${y2}Q${qx3},${qy3},${qx4},${qy4}T${tx1},${ty1}`)
            .fill('none').stroke({color: '#f06', width: 1}).transform({rotation: 180});
    }

    render(context: SVG.G) {
        this.svgElement = context.group();
        this.renderAnnotation();
        this.renderText();
    }

    public eliminateOverLapping() {
        this.overLappingEliminated = false;
        while (this.checkOverLapping()) {
            ++this.layer;
        }
        this.overLappingEliminated = true;
    }

    private checkOverLapping() {
        let allLabelsInThisLine = this.attachToSoftLine.labelViews;
        let allLabelsInThisLayer = allLabelsInThisLine.filter(it =>
            it.overLappingEliminated && it.layer === this.layer
        );
        let thisLeftX = this.x;
        let width = this.width;
        for (let other of allLabelsInThisLayer) {
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

    private renderAnnotation() {
        let annotationPos = this.annotationPos;
        this.annotationElement = this.svgElement.rect(annotationPos.width, annotationPos.height)
            .fill({
                color: '#f06',
                opacity: 0.25
            }).dy(6).dx(annotationPos.leftX);
    }

    private renderText() {
        this.textElement = this.svgElement.group().back().dy((this.layer - 1) * -30);
        let annotationPos = this.annotationPos;
        this.bracket(annotationPos.leftX, -3,
            annotationPos.leftX + annotationPos.width, -3,
            8);
        let textContainerPos = this.textContainerPos;
        this.textElement.rect(textContainerPos.width, AnnotationTextSize + AnnotationTextContainerPadding * 2).radius(3, 3)
            .fill({
                color: '#f06',
                opacity: 0.25
            })
            .stroke('#9a003e').dx(textContainerPos.leftX).dy(-12 - 3 - 8);
        let text = this.textElement.text(this.store.text).font({size: AnnotationTextSize});
        text.dx(textContainerPos.textX).dy(-12 - 3 - 10);
    }

    private get annotationPos() {
        let startIndexInSoftLine = this.store.startIndexInRawContent - this.attachToSoftLine.toGlobalIndex(0);
        let endIndexInSoftLine = this.store.endIndexInRawContent - this.attachToSoftLine.toGlobalIndex(0);
        let parentNode = (this.attachToSoftLine.svgElement.node as any);
        let left = parentNode.getExtentOfChar(startIndexInSoftLine);
        let right: any;
        try {
            right = parentNode.getExtentOfChar(endIndexInSoftLine);
            if (right.width === 0) {
                right = parentNode.getExtentOfChar(endIndexInSoftLine - 1);
                right.x += right.width;
            }
        } catch (e) {
            right = parentNode.getExtentOfChar(endIndexInSoftLine - 1);
            right.x += right.width;
        }
        return {
            leftX: left.x,
            width: right.x - left.x,
            y: left.y,
            height: left.height
        }
    }

    private get textContainerPos() {
        let annotationPosX = this.annotationPos;
        let middleX = annotationPosX.leftX + annotationPosX.width / 2;
        let tempText = (this.attachToSoftLine.svgElement.doc() as SVG.Doc).text(this.store.text).font({size: AnnotationTextSize});
        let textWidth = tempText.node.clientWidth;
        tempText.remove();
        let textContainerWidth = textWidth + 2 * AnnotationTextContainerPadding;
        let textX = middleX - textWidth / 2;
        let textContainerX = textX - AnnotationTextContainerPadding;
        return {
            textX: textX,
            textWidth: textWidth,
            leftX: textContainerX,
            width: textContainerWidth
        };
    }

    private get x() {
        return Math.min(this.annotationPos.leftX, this.textContainerPos.leftX);
    }

    private get width() {
        return Math.max(this.annotationPos.width, this.textContainerPos.width);
    }

    remove() {
        this.svgElement.remove();
    }
}