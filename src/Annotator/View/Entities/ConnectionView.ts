import {Connection} from "../../Store/Entities/Connection";
import {TopContext} from "./TopContext";
import * as SVG from "svg.js";
import {View} from "../View";
import {filter, first} from "rxjs/operators";
import {Base} from "../../Infrastructure/Repository";
import {TopContextUser} from "./TopContextUser";
import {Observable, of} from "rxjs";

export namespace ConnectionView {
    export class Entity extends TopContextUser {
        svgElement: SVG.G;
        textElement: SVG.Text = null;
        layer: number;

        constructor(
            public readonly id: number,
            public readonly store: Connection.Entity,
            public readonly root: View
        ) {
            super();
            let readyToRender: Observable<any>;
            if (!this.priorRendered && !this.posteriorRendered) {
                readyToRender = this.root.labelViewRepo.rendered$.pipe(
                    filter(it => it === this.store.mayNotSameLineLabel.id),
                )
            } else if (this.priorRendered && !this.posteriorRendered) {
                readyToRender = this.root.labelViewRepo.rendered$.pipe(
                    filter(it => it === this.store.mayNotSameLineLabel.id),
                )
            } else if (!this.priorRendered && this.posteriorRendered) {
                readyToRender = this.root.labelViewRepo.rendered$.pipe(
                    filter(it => it === this.store.sameLineLabel.id),
                )
            } else {
                readyToRender = of(1);
            }
            readyToRender.pipe(first()).subscribe(() => {
                this.layer = this.prior.layer + 1;
                this.context.attachTo.addElement(this);
            });
        }

        get context(): TopContext {
            return this.root.labelViewRepo.get(this.store.sameLineLabel.id).context;
        }

        get from() {
            return this.root.labelViewRepo.get(this.store.from.id);
        }

        get fromRendered(): boolean {
            return this.root.labelViewRepo.has(this.store.from.id) && this.from.rendered
        }

        get to() {
            return this.root.labelViewRepo.get(this.store.to.id);
        }

        get toRendered(): boolean {
            return this.root.labelViewRepo.has(this.store.to.id) && this.to.rendered
        }

        get prior() {
            return this.root.labelViewRepo.get(this.store.sameLineLabel.id);
        }

        get priorRendered(): boolean {
            return this.root.labelViewRepo.has(this.store.sameLineLabel.id) && this.prior.rendered;
        }

        get posterior() {
            return this.root.labelViewRepo.get(this.store.mayNotSameLineLabel.id);
        }

        get posteriorRendered(): boolean {
            return this.root.labelViewRepo.has(this.store.mayNotSameLineLabel.id) && this.posterior.rendered;
        }

        get category() {
            return this.store.category;
        }

        get width(): number {
            if (this.textElement === null) {
                this.textElement = this.root.svgDoc.text(this.category.text).font({size: 12});
            }
            return this.textElement.bbox().width;
        }

        get x(): number {
            return (this.from.x + this.to.x + this.to.width - this.width) / 2;
        }

        delete() {
            this.svgElement.remove();
            this.textElement = null;
            this.svgElement = null;
        }

        render() {
            this.svgElement = this.context.svgElement.group();
            if (this.textElement === null) {
                this.textElement = this.svgElement.text(this.category.text).font({size: 12});
            } else {
                this.svgElement.add(this.textElement);
            }
            this.svgElement.x(this.x);
            this.svgElement.y(this.y);
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
        for (let [id, entity] of root.store.connectionRepo) {
            result.push(new Entity(id, entity, root));
        }
        return result;
    }
}