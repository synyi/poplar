import {SliceableText} from "../Interface/SliceableText";
import {TreeNode} from "../../Public/Base/TreeNode";
import {TextSlice} from "./TextSlice";

export class TextHolder extends TreeNode implements SliceableText {
    protected constructor(protected data: string,
                          public children: Array<TextSlice> = []) {
        super(null, children);
    }

    get length(): number {
        return this.data.length
    }

    slice(startIndex: number, endIndex: number): string {
        return this.data.slice(startIndex, endIndex);
    }
}