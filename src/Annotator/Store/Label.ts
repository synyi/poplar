import {TextSlice} from "./Base/TextSlice";

export class Label {
    constructor(public text: string,
                public readonly globalStartIndex: number,
                public readonly globalEndIndex: number) {
    }

    static compare(a: Label, b: Label) {
        if (a.globalStartIndex < b.globalStartIndex) {
            return -1;
        }
        return a.globalEndIndex - b.globalEndIndex;
    }

    startIndexIn(textSlice: TextSlice) {
        return this.globalStartIndex - textSlice.globalStartIndex;
    }

    endIndexIn(textSlice: TextSlice) {
        return this.globalEndIndex - textSlice.globalStartIndex;
    }
}
