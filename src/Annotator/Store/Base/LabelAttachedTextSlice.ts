import {TextSlice} from "./TextSlice";
import {LabelAttached} from "../Interface/LabelAttached";
import {Label} from "../Label";
import {TreeNode} from "../../Public/Base/TreeNode";
import {Sliceable} from "../Interface/Sliceable";

export class LabelAttachedTextSlice extends TextSlice implements LabelAttached {
    constructor(public parent: Sliceable & TreeNode & LabelAttached,
                public startIndexInParent: number,
                public endIndexInParent: number,
                children: Array<LabelAttachedTextSlice> = []) {
        super(parent, startIndexInParent, endIndexInParent, children);
    }

    get labels(): Array<Label> {
        return this.parent.getLabelsInRange(this.startIndexInParent, this.endIndexInParent);
    }

    getFirstLabelCross(index: number): Label {
        return this.parent.getFirstLabelCross(index + this.startIndexInParent);
    }

    getLabelsInRange(startIndex: number, endIndex: number): Array<Label> {
        return this.parent.getLabelsInRange(startIndex + this.startIndexInParent, endIndex + this.startIndexInParent);
    }
}