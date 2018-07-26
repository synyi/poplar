import {TreeNode} from "./TreeNode";

export class LinkedTreeNode extends TreeNode {
    constructor(parent: TreeNode = null, public next: LinkedTreeNode = null, children: Array<TreeNode> = []) {
        super(parent, children);
    }
}