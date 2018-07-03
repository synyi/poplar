import {AnnotationElementBase} from "./AnnotationElementBase";
import {Sentence} from "../../Store/Sentence";
import {Tspan} from "svg.js";
import {LabelView} from "./LabelView";
import {Label} from "../../Store/Label";
import {AddLabelAction} from "../../Action/AddLabel";

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
        this.labels =
            this.correspondingStore.getLabelsInRange(startIndexInHard, endIndexInHard).map((label: Label) => {
                return new LabelView(label, this);
            });
    }

    static getSelectionInfo() {
        const selection = window.getSelection();
        const element = selection.anchorNode;
        // 选取的是[startIndex, endIndex)之间的范围
        let startIndex = selection.anchorOffset;
        let endIndex = selection.focusOffset;
        if (startIndex > endIndex) {
            let temp = startIndex;
            startIndex = endIndex;
            endIndex = temp;
        }
        let selectedString = element.textContent;
        while (selectedString[startIndex] === ' ') {
            ++startIndex;
        }
        while (selectedString[endIndex - 1] === ' ') {
            --endIndex;
        }
        if (startIndex === endIndex) {
            return;
        }
        selectedString = selectedString.slice(startIndex, endIndex);
        return {
            startIndex: startIndex,
            endIndex: endIndex,
            selectedString: selectedString
        }
    }

    render(svgDoc: Tspan) {
        // console.log("Rendering Soft Line", this);
        this.svgElement = svgDoc.tspan(this.correspondingStore.slice(this.startIndexInHard, this.endIndexInHard)).newLine();
        this.svgElement.on("mouseup", () => {
            this.textSelected();
        });
        this.svgElement.annotationObject = this;
        this.labelDrawingContext = this.svgElement.doc().group().back();
        this.labels.map((it: LabelView) => it.render(this.labelDrawingContext));
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
            // this.labels.map((it: LabelView) => it.layout());
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

    requireMoreMarginTopRows() {
        if (this.marginTopRowsCount === 0)
            ++this.marginTopRowsCount;
        this.layout();
    }

    textSelected() {
        let selectionInfo = SoftLine.getSelectionInfo();
        AddLabelAction.emit(selectionInfo.selectedString, this.correspondingStore,
            this.startIndexInHard + selectionInfo.startIndex, this.startIndexInHard + selectionInfo.endIndex);
    }

    addLabel(label: Label) {
        this.labels.push(new LabelView(label, this));
        this.labels[this.labels.length - 1].render(this.labelDrawingContext);
        this.layoutLabels();
    }
}