import {AnnotationElementBase} from "./AnnotationElementBase";
import {Store} from "../../Store/Store";
import {Doc} from "svg.js";
import {TextBlock} from "./TextBlock";

export class Root implements AnnotationElementBase {
    correspondingStore: Store;
    svgElement: any;
    textBlocks: Array<TextBlock> = [];

    constructor(store: Store) {
        this.correspondingStore = store;
        let lastTextBlock: TextBlock = null;
        for (let paragraph of this.correspondingStore.getParagraphs()) {
            let newTextBlock = new TextBlock(paragraph);
            if (lastTextBlock !== null) {
                lastTextBlock.next = newTextBlock;
            }
            this.textBlocks.push(newTextBlock);
            lastTextBlock = newTextBlock;
        }
        // console.log(this.textBlocks);
    }

    render(svgDoc: Doc) {
        // console.log("Start rendering");
        this.svgElement = svgDoc.text('');
        this.svgElement.annotationObject = this;
        this.svgElement.build(true);
        for (let textBlock of this.textBlocks) {
            textBlock.render(this.svgElement);
        }
        this.svgElement.build(false);
    }

    layout() {
    }

    rerender() {
        this.svgElement.clear();
        this.render(this.svgElement.parent);
    }

}