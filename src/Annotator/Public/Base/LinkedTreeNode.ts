import {TreeNode} from "./TreeNode";

/**
 * 同层之间呈单向链表的树节点
 */
export class LinkedTreeNode extends TreeNode {
    constructor(parent: TreeNode = null, public next: LinkedTreeNode = null, children: Array<TreeNode> = []) {
        super(parent, children);
    }
}