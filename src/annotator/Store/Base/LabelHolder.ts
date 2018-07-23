import {Label} from "../Label";

export interface LabelHolder {
    labels: Array<Label>

    getLabelsInRange(startIndex: number, endIndex: number): Array<Label>

    getFirstLabelCross(index: number): Label
}
