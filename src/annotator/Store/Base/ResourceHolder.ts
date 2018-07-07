import {AnnotableString} from "./AnnotableString";
import {Label} from "../Label";

export class ResourceHolder implements AnnotableString {
    data: String;
    labels: Array<Label> = [];

    length(): number {
        return this.data.length;
    }

    slice(startIndex: number, endIndex: number): string {
        return this.data.slice(startIndex, endIndex);
    }

    toString() {
        return this.data.toString();
    }

    getLabels(): Array<Label> {
        return this.labels;
    }

    getLabelsInRange(startIndex: number, endIndex: number) {
        return this.labels.filter((label: Label) => {
            return startIndex <= label.startIndexInRawContent && label.endIndexInRawContent <= endIndex;
        });
    }

    getLabelsCross(index: number): Array<Label> {
        return this.getLabels().filter((label: Label) => {
            return label.startIndexInRawContent <= index && index <= label.endIndexInRawContent;
        });
    }

    getFirstLabelCross(index: number): Label {
        return this.getLabelsCross(index).sort((a: Label, b: Label) => {
            return a.startIndexInRawContent - b.endIndexInRawContent;
        })[0];
    }
}