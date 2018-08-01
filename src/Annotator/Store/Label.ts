import {TextSlice} from "./Base/TextSlice";
import {Connection} from "./Connection";

export class Label {
    constructor(public text: string,
                public readonly globalStartIndex: number,
                public readonly globalEndIndex: number,
                public connectionsFromThis: Set<Connection> = new Set<Connection>(),
                public connectionsToThis: Set<Connection> = new Set<Connection>()) {
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
