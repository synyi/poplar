import {Label} from "../../Store/Element/Label/Label";
import {SoftLineTopPlaceUser} from "../Base/SoftLineTopPlaceUser";
import {SoftLineTopRenderContext} from "./SoftLineTopRenderContext";
import * as SVG from "svg.js";
import {fromEvent, Observable} from "rxjs";
import {EventEmitter} from "events";
import {bufferCount, map} from "rxjs/operators";
import {Annotator} from "../../Annotator";
import {DeleteLabelAction} from "../../Action/DeleteLabelAction";

// todo: make these configable
const TEXT_CONTAINER_PADDING = 3;
const TEXT_SIZE = 12;

export class LabelView extends SoftLineTopPlaceUser {
    static all = new Set<LabelView>();
    static eventEmitter = new EventEmitter();
    static constructed$ = fromEvent(LabelView.eventEmitter, "constructed");
    static _ = fromEvent(LabelView.eventEmitter, 'click').pipe(
        map((it: LabelView) => it.store),
        bufferCount(2)
    ).subscribe((labels: Array<Label>) => Annotator.instance.emit('labelsConnected', labels[0], labels[1]));


    static activeLabelView = null;
    static __ = fromEvent(LabelView.eventEmitter, 'click')
        .subscribe((labelView: LabelView) => {
            if (LabelView.activeLabelView === null)
                LabelView.activeLabelView = labelView;
            else
                LabelView.activeLabelView = null;
        });

    xCoordinateChanged$: Observable<null> = null;
    yCoordinateChanged$: Observable<null> = null;

    svgElement: SVG.G = null;
    highlightElement: SVG.Rect = null;
    annotationElement: SVG.G = null;
    textElement: SVG.Text = null;
    readonly initialLayer = 1;
    readonly readyToRender = true;

    constructor(
        public store: Label,
        context: SoftLineTopRenderContext
    ) {
        super(context);
        this.xCoordinateChanged$ = fromEvent(this, 'xCoordinateChanged');
        this.yCoordinateChanged$ = fromEvent(this, 'yCoordinateChanged');
        LabelView.all.add(this);
        LabelView.eventEmitter.emit("constructed", this);
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

    get annotationElementBox() {
        if (this._annotationElementBox === null) {
            let highlightElementBox = this.highlightElementBox;
            let middleX = highlightElementBox.x + highlightElementBox.width / 2;
            if (this.textElement === null) {
                this.textElement = (this.attachTo.svgElement.doc() as SVG.Doc).text(this.store.text).font({size: TEXT_SIZE});
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

    private _highlightElementBox: {
        x: number,
        y: number,
        width: number,
        height: number
    } = null;

    get highlightElementBox() {
        if (this._highlightElementBox === null) {
            let startIndexInSoftLine = this.store.startIndex - this.attachTo.parent.store.globalStartIndex - this.attachTo.startIndex;
            let endIndexInSoftLine = this.store.endIndex - this.attachTo.parent.store.globalStartIndex - this.attachTo.startIndex;
            let parentNode = this.attachTo.svgElement.node as any as SVGTSpanElement;
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

    get x() {
        return Math.min(this.highlightElementBox.x, this.annotationElementBox.container.x);
    }

    get width() {
        return Math.max(this.highlightElementBox.width, this.annotationElementBox.container.width);
    }

    get y() {
        return -30 * (this.layer - 1);
    }

    get globalY() {
        return this.svgElement.rbox(this.svgElement.doc()).y;
    }

    private get attachTo() {
        return this.context.attachTo;
    }

    _render(context: SVG.G) {
        this.svgElement = this.context.svgElement.group().forward();
        this.renderHighlight();
        this.renderAnnotation();
    }

    render(context: SVG.G) {
        super.render(context);
        this.emit('xCoordinateChanged');
    }

    _destructor() {
        this.store = null;
        this.xCoordinateChanged$ = null;
        this.yCoordinateChanged$ = null;
        LabelView.all.delete(this);
    }

    private renderHighlight() {
        let box = this.highlightElementBox;
        this.highlightElement = this.svgElement.rect(box.width, box.height)
            .fill({
                color: this.store.category.color,
                opacity: 0.5
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
                color: this.store.category.color,
            })
            .stroke(this.store.category.borderColor)
            .x(annotationBox.container.x).y(-TEXT_SIZE - TEXT_CONTAINER_PADDING - 8);
        this.bracket(highLightBox.x, -3, highLightBox.x + highLightBox.width, -3, 8);
        this.annotationElement.put(this.textElement);
        this.textElement.x(annotationBox.text.x).y(-TEXT_SIZE - TEXT_CONTAINER_PADDING - 6);
        this.annotationElement.y(this.y);
        this.annotationElement.style({cursor: 'pointer'});
        console.log(this.annotationElement.node);
        this.annotationElement.node.oncontextmenu = (e) => {
            DeleteLabelAction.emit(this.store);
            this.svgElement.remove();
            this.destructor();
            e.preventDefault();
        };
        this.annotationElement.on('click', (_) => {
            LabelView.eventEmitter.emit('click', this);
        });
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
            .fill('none').stroke({color: this.store.category.borderColor, width: 1}).transform({rotation: 180});
    }
}