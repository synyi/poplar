import {AnnotationElementBase} from "./AnnotationElementBase";
import {Sentence} from "../../Store/Sentence";
import {LabelView} from "./LabelView";

const DEFAULT_LINE_HEIGHT = 20.8;

export class SoftLine implements AnnotationElementBase {
    static suggestWidth = 80;
    store: Sentence;
    svgElement: any;
    labelDrawingContext: any;
    labels: Array<LabelView> = [];
    next: SoftLine = null;
    marginTopRowsCount = 0;

    constructor(store: Sentence,
                public startIndexInHard: number,
                public endIndexInHard: number
    ) {
        this.store = store;
    }

    render(svgDoc: any) {
        this.svgElement = svgDoc.tspan(this.store.slice(this.startIndexInHard, this.endIndexInHard) + ' ').newLine();
        this.svgElement.annotationObject = this;
        this.labelDrawingContext = this.svgElement.doc().group().back();
        this.layout();
    }

    rerender() {
        this.svgElement.clear();
        this.svgElement.text(this.store.slice(this.startIndexInHard, this.endIndexInHard));
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
        this.marginTopRowsCount = Math.max(...this.labels.map(it => it.layer));
        this.layout();
        this.layoutLabels();
    }
}