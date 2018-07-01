import {AnnotationElementBase} from "./AnnotationElementBase";
import {Sentence} from "../../Store/Sentence";
import {Tspan} from 'svg.js'
import {LabelView} from "./LabelView";
import {AddLabelAction} from "../../Action/AddLabel";

const DEFAULT_LINE_HEIGHT = 20.8;

export class SoftLine implements AnnotationElementBase {
    static suggestWidth = 80;

    correspondingStore: Sentence;
    svgElement: any;
    marginTopRowsCount = 0;
    labels = [];


    constructor(store: Sentence,
                public startIndexInHard: number,
                public endIndexInHard: number
    ) {
        this.correspondingStore = store;
    }

    static getSelectionInfo() {
        const selection = window.getSelection();
        const element = selection.baseNode;
        if (element.parentElement.id === 'fake') {
            return null;
        }
        const svgInstance = (element.parentElement as any).instance;
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
        let firstCharPosition = (element.parentElement as any as SVGTextContentElement).getExtentOfChar(startIndex);
        let lastCharPosition = (element.parentElement as any as SVGTextContentElement).getExtentOfChar(endIndex);
        return {
            startIndex: startIndex,
            endIndex: endIndex,
            selectedString: selectedString
        }
    }

    render(svgDoc: Tspan) {
        svgDoc.on("mouseup", () => {
            this.textSelected()
        });
        // console.log("Rendering Soft Line", this);
        this.svgElement = svgDoc.tspan(this.correspondingStore.slice(this.startIndexInHard, this.endIndexInHard)).newLine();
        this.labels.map((it: LabelView) => it.render(this.svgElement));
        this.layout();
    }

    rerender() {
        // this.svgElement.te
        this.svgElement.clear();
        this.svgElement.text(this.correspondingStore.slice(this.startIndexInHard, this.endIndexInHard));
        this.labels.map((it: LabelView) => it.svgElement ? it.rerender() : it.render(this.svgElement));
        this.layout();
    }

    layout() {
        this.svgElement.dy(DEFAULT_LINE_HEIGHT + this.marginTopRowsCount * 30);
    }

    requireMoreMarginTopRows() {
        if (this.marginTopRowsCount == 0)
            ++this.marginTopRowsCount;
        this.layout();
    }

    textSelected() {
        let selectionInfo = SoftLine.getSelectionInfo();
        AddLabelAction.emit(selectionInfo.selectedString, this.correspondingStore,
            this.startIndexInHard + selectionInfo.startIndex, this.startIndexInHard + selectionInfo.endIndex);
    }
}