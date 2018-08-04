import {LinkedTreeNode} from "../../../Public/Base/LinkedTreeNode";
import {Renderable} from "../../Interface/Renderable";
import * as SVG from "svg.js";
import {EventEmitter} from 'events';
import {Destroyable} from "../../../Public/Interface/Destroyable";
import {fromEvent, Observable} from "rxjs";
import {TreeNode} from "../../../Public/Base/TreeNode";

export abstract class TextElement extends LinkedTreeNode implements Renderable, Destroyable {
    children: Array<TextElement> = [];
    nextNode: TextElement = null;
    svgElement: SVG.Element = null;

    constructed$: Observable<TextElement> = null;

    beforeRender$: Observable<TextElement> = null;
    afterRender$: Observable<TextElement> = null;

    beforeLayout$: Observable<TextElement> = null;
    afterLayout$: Observable<TextElement> = null;

    beforeDestruct$: Observable<TextElement> = null;
    afterDestruct$: Observable<TextElement> = null;
    private eventEmitter = new EventEmitter();

    protected constructor(parent: TreeNode) {
        super(parent);

        this.beforeRender$ = fromEvent(this.eventEmitter, 'beforeRender');
        this.afterRender$ = fromEvent(this.eventEmitter, 'afterRender');

        this.beforeLayout$ = fromEvent(this.eventEmitter, 'beforeLayout');
        this.afterLayout$ = fromEvent(this.eventEmitter, 'afterLayout');

        this.beforeDestruct$ = fromEvent(this.eventEmitter, 'beforeDestruct');
        this.afterDestruct$ = fromEvent(this.eventEmitter, 'afterDestruct');
    }

    abstract _render(context: SVG.Element);

    /*final*/
    render(context: SVG.Element) {
        this.emit('beforeRender', this);
        this._render(context);
        this.emit('afterRender', this);
    }

    _layout() {
    }

    /*final*/
    layout() {
        this.emit('beforeLayout', this);
        this._layout();
        for (let child of this.children) {
            child.layout();
        }
        this.emit('afterLayout', this);
        this.layoutAfterSelf();
    }

    layoutAfterSelf() {
        let next: TextElement = this;
        while (next.nextNode && next.nextNode.svgElement) {
            next.nextNode.layout();
            next = next.nextNode;
        }
        if (next.parent instanceof TextElement)
            next.parent.layoutAfterSelf();
    }

    _destructor() {
    }

    /*final*/
    destructor() {
        this.emit('beforeDestruct', this);
        this.children.map(it => it.destructor());
        this.children = [];
        this._destructor();

        let index = this.parent.children.indexOf(this);
        if (index !== 0) {
            let last = this.parent.children[index - 1] as LinkedTreeNode;
            last.nextNode = this.nextNode;
        }

        this.nextNode = null;
        this.svgElement = null;

        this.constructed$ = null;

        this.beforeRender$ = null;
        this.afterRender$ = null;

        this.beforeLayout$ = null;
        this.afterLayout$ = null;

        this.parent = null;
        this.nextNode = null;

        this.emit('afterDestruct', this);
    }

    protected emit(type: string | number, ...args: any[]) {
        this.eventEmitter.emit(type, args);
    }
}