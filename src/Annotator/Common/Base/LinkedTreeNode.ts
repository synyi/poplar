import {TreeNode} from "./TreeNode";

/**
 * 同层之间呈单向链表的树节点
 */
export abstract class LinkedTreeNode extends TreeNode {
    protected constructor(
        parent: TreeNode = null,
        public nextNode: LinkedTreeNode = null,
        children: Array<TreeNode> = []) {
        super(parent, children);
    }

    _destructor() {
        if (this.parent !== null) {
            let index = this.parent.children.indexOf(this);
            if (index !== 0) {
                let last = this.parent.children[index - 1] as LinkedTreeNode;
                last.nextNode = this.nextNode;
            }
        }
        this.nextNode = null;
        super._destructor();
    }
}