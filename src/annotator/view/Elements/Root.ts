import {AnnotationElementBase} from "./AnnotationElementBase";
import {Store} from "../../Store/Store";
import {TextBlock} from "./TextBlock";
import {Label} from "../../Store/Label";
import {EventBus} from "../../../library/EventBus";
import {LabelView} from "./LabelView";
import {SoftLine} from "./SoftLine";
import {HardLine} from "./HardLine";
import {SelectionHandler} from "../SelectionHandler";

export class Root implements AnnotationElementBase {
    store: Store;
    svgElement: any;
    textBlocks: Array<TextBlock> = [];
    labelViews: Array<LabelView> = [];

    constructor(store: Store) {
        this.store = store;
        this.textBlocks = this.divideTextBlocks();
        this.labelViews = this.getLabels();
        EventBus.on('label_added', (_, label: Label) => {
            // fixme: 这里可能导致性能问题
            this.rerender();
        });
    }

    render(svgDoc: any) {
        svgDoc.on("mouseup", () => {
            SelectionHandler.textSelected();
        });
        this.svgElement = svgDoc.text('');
        this.svgElement.annotationObject = this;
        this.svgElement.build(true);
        for (let textBlock of this.textBlocks) {
            textBlock.render(this.svgElement);
        }
        this.svgElement.build(false);
        this.labelViews.map((it) => it.render());
    }

    rerender() {
        this.svgElement.clear();
        this.labelViews.map((it) => it.remove());
        this.textBlocks = this.divideTextBlocks();
        this.labelViews = this.getLabels();
        this.svgElement.build(true);
        for (let textBlock of this.textBlocks) {
            textBlock.render(this.svgElement);
        }
        this.svgElement.build(false);
        this.labelViews.map((it) => it.render());
    }

    private getLabels() {
        let result = [];
        this.textBlocks.map((textBlock: TextBlock) => {
            textBlock.hardLines.map((hardLine: HardLine) => {
                hardLine.softLines.map((softLine: SoftLine) => {
                    this.store.getLabelsInRange(softLine.store.toTextHolderIndex(softLine.startIndexInHard), softLine.store.toTextHolderIndex(softLine.endIndexInHard)).map((label: Label) => {
                        if (softLine.store.toTextHolderIndex(softLine.startIndexInHard) <= label.startIndexInRawContent &&
                            label.endIndexInRawContent <= softLine.store.toTextHolderIndex(softLine.endIndexInHard))
                            result.push(new LabelView(label, softLine));
                    });
                });
            });
        });
        return result;
    }

    layout() {
    }

    private divideTextBlocks() {
        let textBlocks = [];
        let lastTextBlock: TextBlock = null;
        for (let paragraph of this.store.getParagraphs()) {
            let newTextBlock = new TextBlock(paragraph);
            if (lastTextBlock !== null) {
                lastTextBlock.next = newTextBlock;
            }
            textBlocks.push(newTextBlock);
            lastTextBlock = newTextBlock;
        }
        return textBlocks;
    }
}