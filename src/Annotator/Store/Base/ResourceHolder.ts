import {TextHolder} from "./TextHolder";
import {LabelAttached} from "../Interface/LabelAttached";
import {Label} from "../Label";
import {LabelAttachedTextSlice} from "./LabelAttachedTextSlice";

export class ResourceHolder extends TextHolder implements LabelAttached {
    constructor(data: string,
                public labels: Array<Label>,
                children: Array<LabelAttachedTextSlice> = []) {
        super(data, children);
    }

    getFirstLabelCross(index: number): Label {
        for (let label of this.labels) {
            if (label.globalStartIndex < index && index < label.globalEndIndex) {
                return label;
            }
        }
        return null;
    }

    getLabelsInRange(startIndex: number, endIndex: number): Array<Label> {
        let result = [];
        let passedLabelBeforeRange = false;
        // 这里确实可以用二分查找
        // 但我没有信心写Java标准库也写不对的东西
        // see https://bugs.java.com/bugdatabase/view_bug.do?bug_id=5045582
        // after all, it's not a bottleneck, so please leave it alone
        for (let label of this.labels) {
            if (startIndex <= label.globalStartIndex && label.globalEndIndex <= endIndex) {
                passedLabelBeforeRange = true;
                result.push(label);
            } else if (passedLabelBeforeRange) {
                break;
            }
        }
        return result;
    }

    toString(): string {
        return this.data;
    }
}