import {TextSlice} from "./Base/TextSlice";
import {Paragraph} from "./Paragraph";

export class Sentence extends TextSlice {
    constructor(public paragraphBelongTo: Paragraph,
                public startIndexInParent: number,
                public endIndexInParent: number) {
        super(paragraphBelongTo, startIndexInParent, endIndexInParent);
    }
}