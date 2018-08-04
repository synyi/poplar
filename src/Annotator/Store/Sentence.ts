import {LabelAttachedTextSlice} from "./Base/LabelAttachedTextSlice";
import {Paragraph} from "./Paragraph";
import {Label} from "./Label";
import {fromEvent, Observable} from "rxjs";
import {Sliceable} from "./Interface/Sliceable";
import {TreeNode} from "../Public/Base/TreeNode";
import {LabelAttached} from "./Interface/LabelAttached";

export class Sentence extends LabelAttachedTextSlice {
    parent: Paragraph;
    labelAdded$: Observable<Label> = null;

    constructor(parent: Sliceable & TreeNode & LabelAttached,
                startIndexInParent: number,
                endIndexInParent: number) {
        super(parent, startIndexInParent, endIndexInParent);
        this.labelAdded$ = fromEvent(this.eventEmitter, 'labelAdded');
    }

    labelAdded(label: Label) {
        this.eventEmitter.emit('labelAdded', label);
    }
}