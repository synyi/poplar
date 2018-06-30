import {AnnotationElementBase} from "./AnnotationElementBase";
import {Doc} from "svg.js";
import {Store} from "../../Store/Store";
import {TextBlock} from "./TextBlock";
import {Paragraph} from "../../Store/Paragraph";

export class Root implements AnnotationElementBase {
    correspondingStore: Store;
    svgElement: any;
    textBlocks: Array<TextBlock> = [];

    constructor(store: Store) {
        this.correspondingStore = store;
        for (let paragraph of this.correspondingStore.getParagraphs()) {
            this.textBlocks.push(new TextBlock(paragraph as any as Paragraph));
        }
    }

    render(svgDoc: Doc) {
        this.svgElement = svgDoc.text('');
        this.svgElement.build(true);
        for (let textBlock of this.textBlocks) {
            textBlock.render(this.svgElement);
        }
        this.svgElement.build(false);
    }

    rerender() {
        this.svgElement.clear();
        this.svgElement.build(true);
        for (let textBlock of this.textBlocks) {
            textBlock.render(this.svgElement);
        }
        this.svgElement.build(false);
    }

}