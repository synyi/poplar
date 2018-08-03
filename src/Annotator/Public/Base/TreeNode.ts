/**
 * 树节点
 */
export class TreeNode {
    constructor(
        public parent: TreeNode = null,
        public children: Array<TreeNode> = null
    ) {
    }

    /**
     * 获取树根节点
     */
    get ancestor() {
        if (this.parent === null) {
            return this;
        }
        return this.parent.ancestor;
    }
}