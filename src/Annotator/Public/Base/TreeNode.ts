export class TreeNode {
    // thank god, the way default param works in ts doesn't like it in python
    constructor(
        public parent: TreeNode = null,
        public children: Array<TreeNode> = null
    ) {
    }

    get ancestor() {
        if (this.parent === null) {
            return this;
        }
        return this.parent.ancestor;
    }
}