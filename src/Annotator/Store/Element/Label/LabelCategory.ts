import {Category} from "../../Base/Category";

export class LabelCategory extends Category {
    constructor(
        text: string,
        public color: string,
        public borderColor: string
    ) {
        super(text)
    }
}