import {Base} from "../../Infrastructure/Repository";
import {View} from "../View";
import * as SVG from "svg.js";
import {Line} from "../../Store/Entities/Line";
import {filter} from "rxjs/operators";
import {Label} from "../../Store/Entities/Label";
import {LabelView} from "./LabelView";
import {ConnectionView} from "./ConnectionView";
import {TopContext} from "./TopContext";
import {TopContextUser} from "./TopContextUser";

export namespace LineView {
    export class Entity {
        svgElement: SVG.Tspan = null;
        topContext: TopContext;

        constructor(
            public readonly id: number,
            public store: Line.Entity,
            public readonly root: View) {
            this.topContext = new TopContext(this);
            root.store.lineRepo.updated$.pipe(filter(it => it === this.id)).subscribe(() => {
                this.store = root.store.lineRepo.get(id);
                this.rerender();
            });
            root.store.labelRepo.created$
                .pipe(filter(it => this.store.isLabelInThisLine(it)))
                .subscribe(it => {
                    const newLabelView = new LabelView.Entity(it, this.root.store.labelRepo.get(it), this.topContext);
                    this.root.labelViewRepo.add(newLabelView);
                    this.addElement(newLabelView);
                });
        }

        render(context: SVG.Text) {
            this.svgElement = context.tspan(this.store.text).newLine();
            (this.svgElement as any).AnnotatorElement = this;
            this.svgElement.on('mouseup', () => {
                this.root.root.textSelectionHandler.textSelected();
            });
            this.topContext.elements.forEach(it => it.eliminateOverlapping());
            this.svgElement.dy(this.topContext.height + 20.8);
            this.topContext.render(this.svgElement.doc() as SVG.Doc);
        }

        layout(dy: number) {
            // line's layout will be handled by svg.js itself
            this.topContext.layout(dy);
            for (let [id, _] of this.root.lineViewRepo) {
                if (id > this.id) {
                    return;
                }
            }
            this.root.resize();
        }

        addElement(element: TopContextUser) {
            const originHeight = this.topContext.height;

            this.topContext.elements.add(element);
            element.eliminateOverlapping();
            const newHeight = this.topContext.height;
            this.svgElement.dy(newHeight + 20.8);
            const dy = newHeight - originHeight;
            this.layout(dy);
            element.render();

            this.layoutAfterSelf(dy);
        }

        get rendered(): boolean {
            return this.svgElement !== null;
        }

        delete() {
            const dy = -this.topContext.height - 20.8;
            this.topContext.delete();
            // It's sad that svg.js doesn't support `this.svgElement.remove()`
            this.svgElement.node.remove();
            this.layoutAfterSelf(dy);
        }

        removeElement(element: TopContextUser) {
            const originHeight = this.topContext.height;

            this.topContext.elements.delete(element);
            const newHeight = this.topContext.height;
            this.svgElement.dy(newHeight + 20.8);
            const dy = newHeight - originHeight;
            this.layout(dy);

            this.layoutAfterSelf(dy);
        }

        rerender() {
            this.topContext.delete();
            const originHeight = 0;
            this.topContext = new TopContext(this);
            const labels = this.store.labelsInThisLine;
            labels.map((label: Label.Entity) => {
                const newLabelView = new LabelView.Entity(label.id, label, this.topContext);
                this.root.labelViewRepo.add(newLabelView);
                this.topContext.elements.add(newLabelView);
                for (let connection of label.sameLineConnections) {
                    const newConnectionView = new ConnectionView.Entity(connection.id, connection, this.root);
                    this.root.connectionViewRepo.add(newConnectionView);
                }
            });

            this.svgElement.clear();
            this.svgElement.plain(this.store.text);
            this.topContext.elements.forEach(it => it.eliminateOverlapping());

            const newHeight = this.topContext.height;
            let dy = newHeight - originHeight;
            this.svgElement.dy(newHeight + 20.8);
            this.topContext.render(this.svgElement.doc() as SVG.Doc);
            this.layoutAfterSelf(dy);
        }

        private layoutAfterSelf(dy: number) {
            for (let id = this.id + 1; id < this.root.lineViewRepo.length; ++id) {
                if (this.root.lineViewRepo.has(id) && this.root.lineViewRepo.get(id).rendered) {
                    this.root.lineViewRepo.get(id).layout(dy);
                }
            }
        }
    }

    export class Repository extends Base.Repository<Entity> {
        root: View;

        constructor(root: View) {
            super(root);
        }

        delete(key: number | Entity): boolean {
            if (typeof key !== "number") {
                key = key.id;
            }
            if (this.has(key)) {
                this.get(key).delete();
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