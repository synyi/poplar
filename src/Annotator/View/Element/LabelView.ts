import * as SVG from "svg.js";
import {Label} from "../../Store/Label";
import {SoftLine} from "./SoftLine";
import {SoftLineTopPlaceUser} from "./Base/SoftLineTopPlaceUser";
import {assert} from "../../Tools/Assert";
import {fromEvent, Observable, of} from "rxjs";
import {EventEmitter} from "events";

const TEXT_CONTAINER_PADDING = 3;
const TEXT_SIZE = 12;

export class LabelView extends SoftLineTopPlaceUser {
    svgElement: SVG.G = null;
    highlightElement: SVG.Rect = null;
    annotationElement: SVG.G = null;
    textElement: SVG.Text = null;

    constructed$: Observable<LabelView> = null;

    beforeRender$: Observable<LabelView> = null;
    afterRender$: Observable<LabelView> = null;

    beforeDestruct$: Observable<LabelView> = null;
    afterDestruct$: Observable<LabelView> = null;

    private eventEmitter = new EventEmitter();

    constructor(public attachedTo: SoftLine, public store: Label) {
        super(attachedTo.topContext);

        this.beforeRender$ = fromEvent(this.eventEmitter, 'beforeRender');
        this.afterRender$ = fromEvent(this.eventEmitter, 'afterRender');

        this.beforeDestruct$ = fromEvent(this.eventEmitter, 'beforeDestruct');
        this.afterDestruct$ = fromEvent(this.eventEmitter, 'afterDestruct');

        this.constructed$ = of(this);
    }

    private _highlightElementBox: {
        x: number,
        y: number,
        width: number,
        height: number
    } = null;

    get annotationElementBox() {
        if (this._annotationElementBox === null) {
            let highlightElementBox = this.highlightElementBox;
            let middleX = highlightElementBox.x + highlightElementBox.width / 2;
            if (this.textElement === null) {
                this.textElement = (this.attachedTo.svgElement.doc() as SVG.Doc).text(this.store.text).font({size: TEXT_SIZE});
            }
            let textWidth = this.textElement.bbox().width;
            let containerWidth = textWidth + 2 * TEXT_CONTAINER_PADDING;
            let textX = middleX - textWidth / 2;
            let containerX = textX - TEXT_CONTAINER_PADDING;
            this._annotationElementBox = {
                text: {
                    x: textX,
                    width: textWidth
                },
                container: {
                    x: containerX,
                    y: highlightElementBox.y,
                    width: containerWidth
                }
            }
        }
        return this._annotationElementBox;
    }

    get globalAnnotationElementBox() {
        return this.annotationElement.rbox(this.svgElement.doc());
    }

    get x() {
        return Math.min(this.highlightElementBox.x, this.annotationElementBox.container.x);
    }

    get width() {
        return Math.max(this.highlightElementBox.width, this.annotationElementBox.container.width);
    }

    get y() {
        return -30 * (this.layer - 1);
    }

    private _annotationElementBox: {
        text: {
            x: number,
            width: number
        },
        container: {
            x: number,
            y: number,
            width: number
        }
    } = null;

    get highlightElementBox() {
        if (this._highlightElementBox === null) {
            let startIndexInSoftLine = this.store.startIndexIn(this.attachedTo.parent.store) - this.attachedTo.startIndex;
            let endIndexInSoftLine = this.store.endIndexIn(this.attachedTo.parent.store) - this.attachedTo.startIndex;
            let parentNode = this.attachedTo.svgElement.node as any as SVGTSpanElement;
            let firstCharBox = parentNode.getExtentOfChar(startIndexInSoftLine);
            let lastCharBox = parentNode.getExtentOfChar(endIndexInSoftLine - 1);
            this._highlightElementBox = {
                x: firstCharBox.x,
                y: firstCharBox.y,
                width: lastCharBox.x - firstCharBox.x + lastCharBox.width,
                height: firstCharBox.height
            }
        }
        return this._highlightElementBox;
    }

    render() {
        assert(!this.overlapping);
        this.svgElement = this.context.svgElement.group();
        this.renderHighlight();
        this.renderAnnotation();
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
        return this.annotationElement.path(`M${x1},${y1}Q${qx1},${qy1},${qx2},${qy2}T${tx1},${ty1}M${x2},${y2}Q${qx3},${qy3},${qx4},${qy4}T${tx1},${ty1}`)
            .fill('none').stroke({color: '#f06', width: 1}).transform({rotation: 180});
    }

    private renderHighlight() {
        let box = this.highlightElementBox;
        this.highlightElement = this.svgElement.rect(box.width, box.height)
            .fill({
                color: '#f06',
                opacity: 0.25
            })
            .dy(6).dx(box.x);
    }

    private renderAnnotation() {
        let highLightBox = this.highlightElementBox;
        let annotationBox = this.annotationElementBox;
        this.annotationElement = this.svgElement.group().back();
        this.annotationElement.rect(annotationBox.container.width, TEXT_SIZE + TEXT_CONTAINER_PADDING * 2)
            .radius(3, 3)
            .fill({
                color: '#ffa5be'
            })
            .stroke('#9a003e')
            .x(annotationBox.container.x).y(-TEXT_SIZE - TEXT_CONTAINER_PADDING - 8);
        this.bracket(highLightBox.x, -3, highLightBox.x + highLightBox.width, -3, 8);
        this.annotationElement.put(this.textElement);
        this.textElement.x(annotationBox.text.x).y(-TEXT_SIZE - TEXT_CONTAINER_PADDING - 6);
        this.annotationElement.y(this.y);
    }
}