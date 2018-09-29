import {Base} from "../../Infrastructure/Repository";
import {View} from "../View";
import * as SVG from "svg.js";
import {Line} from "../../Store/Entities/Line";
import {TopContext} from "./TopContext";
import {filter} from "rxjs/operators";
import {fromEvent, Observable} from "rxjs";

export namespace LineView {
    export class Entity {
        svgElement: SVG.Tspan = null;
        xCoordinateOfChar: Array<number>;
        y: number;
        topContext: TopContext = null;
        height: number;

        constructor(
            public readonly id: number,
            public store: Line.Entity,
            public readonly root: View) {
            this.xCoordinateOfChar = [];
            this.topContext = new TopContext(this);
            root.store.lineRepo.updated$.pipe(filter(it => it === this.id)).subscribe(() => {
                this.store = root.store.lineRepo.get(id);
                this.rerender();
            });
        }

        get prev(): Entity {
            let firstIterator = this.root.lineViewRepo[Symbol.iterator]();
            let secondIterator = this.root.lineViewRepo[Symbol.iterator]();
            let id = secondIterator.next().value[0];
            let result: Entity = null;
            while (id !== this.id) {
                result = firstIterator.next().value[1];
                id = secondIterator.next().value[0];
            }
            return result;
        }

        get isFirst() {
            for (let [id, _] of this.root.lineViewRepo) {
                if (id < this.id) {
                    return false;
                }
            }
            return true;
        }

        get isLast() {
            for (let [id, _] of this.root.lineViewRepo) {
                if (id > this.id) {
                    return false;
                }
            }
            return true
        }

        remove() {
            let dy = -this.topContext.height - this.height;
            this.topContext.remove();
            this.svgElement.node.remove();
            this.layoutAfterSelf(dy);
        }

        render(context: SVG.Text) {
            this.svgElement = context.tspan(this.store.text).newLine();
            (this.svgElement as any).AnnotatorElement = this;
            this.svgElement.on('mouseup', () => {
                this.root.root.textSelectionHandler.textSelected();
            });
        }

        renderTopContext() {
            this.topContext.render();
        }

        layout(dy: number = this.topContext.height + this.height) {
            // line itself's layout will be handled by svg.js itself
            this.svgElement.dy(dy);
        }

        get rendered(): boolean {
            return this.svgElement !== null;
        }

        layoutAfterSelf(dy: number) {
            for (let id = this.id + 1; id < this.root.lineViewRepo.length; ++id) {
                if (this.root.lineViewRepo.has(id) && this.root.lineViewRepo.get(id).rendered) {
                    this.root.lineViewRepo.get(id).topContext.layout(dy);
                }
            }
            this.root.resize();
        }

        calculateInitialPosition() {
            this.xCoordinateOfChar = [];
            this.y = (this.svgElement.node as any).getExtentOfChar(0).y;
            for (let i = 0; i < this.store.text.length; ++i) {
                this.xCoordinateOfChar.push((this.svgElement.node as any).getExtentOfChar(i).x);
            }
            let last = (this.svgElement.node as any).getExtentOfChar(this.store.text.length - 1);
            this.height = last.height;
            this.xCoordinateOfChar.push(last.x + last.width);
        }

        private rerender() {
            const oldHeight = this.topContext.height;
            this.topContext.remove();
            this.svgElement.clear();
            this.svgElement.plain(this.store.text);
            this.calculateInitialPosition();
            this.topContext = new TopContext(this);
            this.topContext.preRender(this.svgElement.doc() as SVG.Doc);
            this.topContext.initPosition();
            this.layout();
            this.layoutAfterSelf(this.topContext.height - oldHeight);
            this.renderTopContext();
            this.topContext.layout(null);
            this.topContext.postRender();
            this.topContext.attachTo.root.lineViewRepo.rerendered(this.id);
        }
    }

    export class Repository extends Base.Repository<Entity> {
        root: View;

        rerendered$: Observable<number> = null;

        constructor(root: View) {
            super(root);
            this.rerendered$ = fromEvent(this.eventEmitter, "rerendered");
        }

        rerendered(id: number) {
            this.eventEmitter.emit("rerendered", id);
        }

        delete(key: number | Entity): boolean {
            if (typeof key !== "number") {
                key = key.id;
            }
            if (this.has(key)) {
                this.get(key).remove();
            }
            return super.delete(key);
        }


    }

    export function constructAll(root: View): Array<Entity> {
        let result = [];
        for (let [id, entity] of root.store.lineRepo) {
            result.push(new Entity(id, entity, root));
        }
        return result;
    }
}