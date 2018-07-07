import {AnnotableString} from "./AnnotableString";
import {ResourceHolder} from "./ResourceHolder";
import {Label} from "../Label";

export class AnnotableStringSlice implements AnnotableString {
    constructor(public parent: AnnotableString,
                public startIndexInParent: number,
                public endIndexInParent: number) {
    }

    get textHolder(): ResourceHolder {
        if (this.parent instanceof ResourceHolder) {
            return this.parent
        } else if (this.parent instanceof AnnotableStringSlice) {
            return this.parent.textHolder;
        }
        throw TypeError;
    }

    length(): number {
        return this.endIndexInParent - this.startIndexInParent;
    }

    slice(startIndex: number, endIndex: number): string {
        return this.parent.slice(this.startIndexInParent + startIndex, this.startIndexInParent + endIndex);
    }

    toTextHolderIndex(localIndex: number): number {
        if (this.parent instanceof ResourceHolder) {
            return this.startIndexInParent + localIndex;
        } else if (this.parent instanceof AnnotableStringSlice) {
            return this.parent.toTextHolderIndex(this.startIndexInParent + localIndex);
        }
        throw TypeError;
    }

    toLocalIndex(textHolderIndex: number): number {
        return textHolderIndex - this.toTextHolderIndex(0)
    }

    getLabels(): Array<Label> {
        return this.parent.getLabelsInRange(this.startIndexInParent, this.endIndexInParent);
    }

    getLabelsInRange(startIndex: number, endIndex: number) {
        return this.parent.getLabelsInRange(this.startIndexInParent + startIndex, this.startIndexInParent + endIndex);
    }

    toString(): string {
        return this.parent.slice(this.startIndexInParent, this.endIndexInParent);
    }

    getLabelsCross(index: number): Array<Label> {
        return this.getLabels().filter((label: Label) => {
            return this.toLocalIndex(label.startIndexInRawContent) <= index && index <= this.toLocalIndex(label.endIndexInRawContent);
        });
    }

    getFirstLabelCross(index: number): Label {
        return this.getLabelsCross(index).sort((a: Label, b: Label) => {
            return a.startIndexInRawContent - b.endIndexInRawContent;
        })[0];
    }
}
