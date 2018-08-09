import {SliceableText} from "../Interface/SliceableText";
import {TextSlice} from "./TextSlice";
import {TreeNode} from "../../Common/Base/TreeNode";

/**
 * 文本的持有者
 */
export class TextHolder extends TreeNode implements SliceableText {
    children: Array<TextSlice>;

    protected constructor(protected data: string, children: Array<TextSlice> = []) {
        super(null, children);
    }

    get length(): number {
        return this.data.length;
    }

    slice(startIndex: number, endIndex: number): string {
        return this.data.slice(startIndex, endIndex);
    }
}