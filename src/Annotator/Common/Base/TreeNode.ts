import {Destructable} from "./Destructable";
import {assert} from "../Tools/Assert";

/**
 * 树节点
 */
export abstract class TreeNode extends Destructable {
    protected constructor(
        public parent: TreeNode = null,
        public children: Array<TreeNode> = []
    ) {
        super();
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

    _destructor() {
        if (this.parent !== null) {
            this.parent.children.splice(this.parent.children.indexOf(this), 1);
        }
        let children = this.children.slice();
        children.forEach(it => it.destructor());
        assert(this.children.length === 0);
        this.parent = null;
    }
}