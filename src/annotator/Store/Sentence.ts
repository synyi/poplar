import {Paragraph} from "./Paragraph";
import {AnnotableStringSlice} from "./Base/AnnotableStringSlice";

export class Sentence extends AnnotableStringSlice {
    constructor(private paragraphBelongTo: Paragraph,
                public startIndexInParent: number,
                public endIndexInParent: number) {
        super(paragraphBelongTo, startIndexInParent, endIndexInParent);
    }
}
