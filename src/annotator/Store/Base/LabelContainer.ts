import {Label} from "../Label";

// All ranges here are in local coordinate
export interface LabelContainer {
    getLabels(): Array<Label>

    getLabelsInRange(startIndex: number, endIndex: number): Array<Label>

    getLabelsCross(index: number): Array<Label>

    getFirstLabelCross(index: number): Label
}