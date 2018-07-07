import {AnnotationElementBase} from "./AnnotationElementBase";
import {Store} from "../../Store/Store";
import {Doc} from "svg.js";
import {TextBlock} from "./TextBlock";
import {Label} from "../../Store/Label";
import {EventBus} from "../../../library/EventBus";
import {LabelView} from "./LabelView";
import {SoftLine} from "./SoftLine";
import {HardLine} from "./HardLine";

export class Root implements AnnotationElementBase {
    correspondingStore: Store;
    svgElement: any;
    textBlocks: Array<TextBlock> = [];
    labelViews: Array<LabelView> = [];

    constructor(store: Store) {
        this.correspondingStore = store;
        this.textBlocks = this.divideTextBlocks();
        this.labelViews = this.getLabels();
        // EventBus.on('merge_paragraph', (_, mergeInfo) => {
        //     let mergeStartTxtBlkIdx = this.textBlocks.findIndex((textBlock: TextBlock) => {
        //         return textBlock.correspondingStore.toTextHolderIndex(textBlock.correspondingStore.startIndexInParent) <= mergeInfo.startIndex &&
        //             mergeInfo.startIndex < textBlock.correspondingStore.toTextHolderIndex(textBlock.correspondingStore.endIndexInParent);
        //     });
        //     let mergeEndTxtBlkIdx = this.textBlocks.findIndex((textBlock: TextBlock) => {
        //         return textBlock.correspondingStore.toTextHolderIndex(textBlock.correspondingStore.startIndexInParent) <= mergeInfo.endIndex &&
        //             mergeInfo.startIndex < textBlock.correspondingStore.toTextHolderIndex(textBlock.correspondingStore.endIndexInParent);
        //     });
        //     if (mergeStartTxtBlkIdx === mergeEndTxtBlkIdx)
        //         return;
        //     for (let i = mergeStartTxtBlkIdx + 1; i < mergeEndTxtBlkIdx; ++i) {
        //         this.textBlocks[i].remove();
        //     }
        //     this.textBlocks[mergeStartTxtBlkIdx].setStore(mergeInfo.mergedInto);
        //     this.textBlocks[mergeStartTxtBlkIdx].rerender();
        // });
        EventBus.on('label_added', (_, label: Label) => {
            this.rerender();
        });
    }

    render(svgDoc: Doc) {
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
                    this.correspondingStore.getLabelsInRange(softLine.correspondingStore.toTextHolderIndex(softLine.startIndexInHard), softLine.correspondingStore.toTextHolderIndex(softLine.endIndexInHard)).map((label: Label) => {
                        if (softLine.correspondingStore.toTextHolderIndex(softLine.startIndexInHard) <= label.startIndexInRawContent &&
                            label.endIndexInRawContent <= softLine.correspondingStore.toTextHolderIndex(softLine.endIndexInHard))
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
        for (let paragraph of this.correspondingStore.getParagraphs()) {
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