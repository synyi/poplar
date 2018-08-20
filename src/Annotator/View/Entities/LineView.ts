import {Base} from "../../Infrastructure/Repository";
import {View} from "../View";
import * as SVG from "svg.js";
import {Line} from "../../Store/Entities/Line";
import {TopContext, TopContextUser} from "./TopContext";

export namespace LineView {
    export class Entity {
        svgElement: SVG.Tspan;
        topContext: TopContext;

        constructor(
            public readonly id: number,
            public store: Line.Entity) {
            this.topContext = new TopContext(this);
        }

        render(context: SVG.Text) {
            this.svgElement = context.tspan(this.store.text).newLine();
            this.topContext.elements.forEach(it => it.eliminateOverlapping());
            this.svgElement.dy(this.topContext.height + 20.8);
            this.topContext.render(this.svgElement.doc() as SVG.Doc);
        }

        layout(dy: number) {
            if (dy === null) {
                let originY = (this.svgElement.node as any).getExtentOfChar(0).y;
                this.topContext.svgElement.y(originY);
            } else {
                this.topContext.svgElement.y(this.topContext.svgElement.y() - dy - 20.8);
            }
        }

        addElement(element: TopContextUser) {
            this.topContext.elements.add(element);
            element.eliminateOverlapping();
            this.svgElement.dy(this.topContext.height + 20.8);
            this.layout(null);
            element.render();
        }

        delete(): number {
            const dy = this.topContext.height;
            this.topContext.delete();
            this.svgElement.node.remove();
            return dy;
        }

        rerender() {
            this.topContext.delete();
            this.svgElement.clear();
            this.svgElement.plain(this.store.text);
            this.topContext.elements.forEach(it => it.eliminateOverlapping());
            this.svgElement.dy(this.topContext.height + 20.8);
            this.topContext.render(this.svgElement.doc() as SVG.Doc);
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

    export function constructAll(storeRepo: Line.Repository): Array<Entity> {
        let result = [];
        for (let [id, entity] of storeRepo) {
            result.push(new Entity(id, entity));
        }
        return result;
    }
}