import {Label} from "../Label";

export interface LabelAttached {
    labels: Array<Label>;

    /**
     * 获取完全在[startIndex,endIndex)内部的所有标签
     */
    getLabelsInRange(startIndex: number, endIndex: number): Array<Label>

    /**
     * 获取首个 "穿过" index 的标签
     * @note 穿过指start < index < end
     */
    getFirstLabelCross(index: number): Label
}