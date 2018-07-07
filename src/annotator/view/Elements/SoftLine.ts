import {AnnotationElementBase} from "./AnnotationElementBase";
import {Sentence} from "../../Store/Sentence";
import {Tspan} from "svg.js";
import {LabelView} from "./LabelView";
import {SelectionHandler} from "../SelectionHandler";

const DEFAULT_LINE_HEIGHT = 20.8;

export class SoftLine implements AnnotationElementBase {
    static suggestWidth = 80;
    correspondingStore: Sentence;
    svgElement: any;
    labelDrawingContext: any;
    labels: Array<LabelView> = [];
    next: SoftLine = null;
    marginTopRowsCount = 0;

    constructor(store: Sentence,
                public startIndexInHard: number,
                public endIndexInHard: number
    ) {
        this.correspondingStore = store;
    }

    render(svgDoc: Tspan) {
        this.svgElement = svgDoc.tspan(this.correspondingStore.slice(this.startIndexInHard, this.endIndexInHard) + ' ').newLine();
        this.svgElement.on("mouseup", () => {
            SelectionHandler.textSelected();
        });
        this.svgElement.annotationObject = this;
        this.labelDrawingContext = this.svgElement.doc().group().back();
        this.layout();
    }

    rerender() {
        this.svgElement.clear();
        this.svgElement.text(this.correspondingStore.slice(this.startIndexInHard, this.endIndexInHard));
        this.labels.map((it: LabelView) => it.rerender());
        this.layout();
    }

    layout() {
        if (this.svgElement) {
            this.svgElement.dy(DEFAULT_LINE_HEIGHT + 30 * this.marginTopRowsCount);
            this.labelDrawingContext.move(this.svgElement.x(), this.svgElement.y());
            if (this.next) {
                this.next.layout();
            } else if (this.svgElement.parent().annotationObject &&
                this.svgElement.parent().annotationObject.next) {
                this.svgElement.parent().annotationObject.next.layout();
            }
        }
    }

    layoutLabels() {
        this.labels.map((it: LabelView) => it.layout());
        if (this.next) {
            this.next.layoutLabels()
        }
        if (this.svgElement.parent() && this.svgElement.parent().node.nextSibling) {
            let instance = this.svgElement.parent().node.nextSibling.instance;
            if (instance.annotationObject) {
                instance.annotationObject.layoutLabels();
            }
        }
    }

    updateMarginTopRowsCount() {
        if (this.marginTopRowsCount === 0)
            ++this.marginTopRowsCount;
        this.layout();
    }
}