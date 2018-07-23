import {Sliceable} from "./Sliceable";

export class TextSlice implements Sliceable {
    constructor(protected parent: Sliceable,
                protected startIndexInParent: number,
                protected endIndexInParent: number) {
    }

    get length(): number {
        return this.endIndexInParent - this.startIndexInParent;
    }

    toString(): string {
        return this.parent.slice(this.startIndexInParent, this.endIndexInParent);
    }

    slice(startIndex: number, endIndex: number): string {
        return this.parent.slice(startIndex + this.startIndexInParent, endIndex + this.startIndexInParent);
    }

    get startIndexInAncestor() {
        if (this.parent instanceof TextSlice) {
            return this.parent.startIndexInAncestor + this.startIndexInParent;
        } else {
            return this.startIndexInParent;
        }
    }

    get endIndexInAncestor() {
        return this.startIndexInAncestor + this.length;
    }
}