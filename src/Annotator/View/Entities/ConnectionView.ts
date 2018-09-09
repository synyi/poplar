import {TopContextUser} from "./TopContextUser";
import * as SVG from "svg.js";
import {View} from "../View";
import {Connection} from "../../Store/Entities/Connection";
import {ConnectionCategory} from "../../Store/Entities/ConnectionCategory";
import {Base} from "../../Infrastructure/Repository";
import {TopContext} from "./TopContext";
import {Subscription} from "rxjs";
import {filter} from "rxjs/operators";

export namespace ConnectionView {
    export class Entity extends TopContextUser {
        svgElement: SVG.G = null;
        textElement: SVG.Text = null;
        lineElement: SVG.Path = null;
        layer: number;
        positionChangedSubscription: Subscription = null;
        rerenderedSubscription: Subscription = null;
        width: number;

        constructor(
            public readonly id: number,
            public readonly store: Connection.Entity,
            public readonly context: TopContext
        ) {
            super();
        }

        get x(): number {
            return (this.from.annotationElementBox.container.x + this.to.annotationElementBox.container.x + this.to.annotationElementBox.container.width - this.width) / 2;
        }

        get from() {
            return this.context.attachTo.root.labelViewRepo.get(this.store.from.id);
        }

        get to() {
            return this.context.attachTo.root.labelViewRepo.get(this.store.to.id);
        }

        get prior() {
            return this.context.attachTo.root.labelViewRepo.get(this.store.sameLineLabel.id);
        }

        get posterior() {
            return this.context.attachTo.root.labelViewRepo.get(this.store.mayNotSameLineLabel.id);
        }

        private get category(): ConnectionCategory.Entity {
            return this.store.category;
        }

        get inline() {
            return this.posterior.context === this.prior.context;
        }

        initPosition() {
            this.width = this.textElement.bbox().width;
        }

        preRender() {
            this.svgElement = this.context.svgElement.group();
            this.textElement = this.svgElement.text(this.category.text).font({size: 12});
            this.textElement.style({
                '-webkit-user-select': 'none',
                '-khtml-user-select': 'none',
                '-moz-user-select': 'none',
                '-ms-user-select': 'none',
                'user-select': 'none',
            });
            this.svgElement.on('contextmenu', (e) => {
                this.context.attachTo.root.root.emit('connectionRightClicked', this.id, e.clientX, e.clientY);
                e.preventDefault();
            });
            this.svgElement.addClass('connection-view');
            // to deceive svg.js not to call bbox when call x() and y()
            // bad for svg.js
            this.svgElement.attr('x', "");
            this.svgElement.attr('y', "");
            this.textElement.attr('x', "");
            this.textElement.attr('y', "");
        }

        render() {
            this.svgElement.rect(this.width, 12).y(5).fill('white').back();
            this.svgElement.x(this.x);
            this.svgElement.y(this.y);
        }

        rerender() {
            this.svgElement.x(this.x);
            this.svgElement.y(this.y);
            this.rerenderLines();
        }

        rerenderLines() {
            this.svgElement.x(this.x);
            this.svgElement.y(this.y);
            this.lineElement.remove();
            this.renderLines();
        }

        eliminateOverlapping() {
            if (this.prior.context === this.posterior.context) {
                this.layer = Math.max(this.prior.layer, this.posterior.layer) + 1;
            } else {
                this.layer = this.prior.layer + 1;
            }
            super.eliminateOverlapping();
        }

        postRender() {
            if (this.lineElement !== null) {
                this.lineElement.remove();
            }
            this.renderLines();
        }

        remove() {
            this.textElement.remove();
            this.lineElement.remove();
            this.svgElement.remove();
            if (this.positionChangedSubscription !== null)
                this.positionChangedSubscription.unsubscribe();
            this.rerenderedSubscription.unsubscribe();
            this.textElement = null;
            this.lineElement = null;
            this.svgElement = null;
            this.positionChangedSubscription = null;
            this.rerenderedSubscription = null;
        }

        private renderLines() {
            let thisY = 0;
            let fromY = 0;
            let toY = 0;
            let context: SVG.Container = null;
            if (this.inline) {
                fromY = this.from.y - 5;
                thisY = this.y + 20.8 - 11;
                toY = this.to.y - 5;
                context = this.context.svgElement;
            } else {
                fromY = this.from.y + this.from.context.y - 4;
                thisY = this.y + this.context.y + 11;
                toY = this.to.y + this.to.context.y - 5;
                context = (this.svgElement.doc() as SVG.Doc);
            }
            if (this.from.annotationElementBox.container.x < this.to.annotationElementBox.container.x) {
                this.lineElement = context.path(
                    `
                M ${this.from.annotationElementBox.container.x}                    ${fromY}
                C ${this.from.annotationElementBox.container.x - 10}               ${thisY},
                  ${this.from.annotationElementBox.container.x - 10}               ${thisY},
                  ${this.from.annotationElementBox.container.x}                    ${thisY}
                L ${this.x}                         ${thisY}
                M ${this.x + this.width}            ${thisY}
                L ${this.to.annotationElementBox.container.x + this.to.annotationElementBox.container.width}      ${thisY}
                C ${this.to.annotationElementBox.container.x + this.to.annotationElementBox.container.width + 10} ${thisY},
                  ${this.to.annotationElementBox.container.x + this.to.annotationElementBox.container.width + 10} ${thisY},
                  ${this.to.annotationElementBox.container.x + this.to.annotationElementBox.container.width}      ${toY}
                `).stroke('black').fill('transparent');
            } else {
                this.lineElement = context.path(
                    `
                M ${this.from.annotationElementBox.container.x + this.from.annotationElementBox.container.width}      ${fromY}
                C ${this.from.annotationElementBox.container.x + this.from.annotationElementBox.container.width + 10} ${thisY},
                  ${this.from.annotationElementBox.container.x + this.from.annotationElementBox.container.width + 10} ${thisY},
                  ${this.from.annotationElementBox.container.x + this.from.annotationElementBox.container.width}      ${thisY}
                L ${this.x + this.width}                ${thisY}
                M ${this.x}                             ${thisY}
                L ${this.to.annotationElementBox.container.x}                          ${thisY}
                C ${this.to.annotationElementBox.container.x - 10}                     ${thisY},
                  ${this.to.annotationElementBox.container.x - 10}                     ${thisY},
                  ${this.to.annotationElementBox.container.x}                          ${toY}
                `).stroke('black').fill('transparent');
            }
            this.lineElement.marker('end', 5, 5, function (add) {
                add.polyline('0,0 5,2.5 0,5 0.2,2.5');
            });
            this.lineElement.back();
            this.lineElement.on('mouseover', () => {
                this.lineElement.stroke({width: 1.5, color: 'red'});
            });
            this.svgElement.on('mouseover', () => {
                this.lineElement.stroke({width: 1.5, color: 'red'});
            });
            this.lineElement.on('mouseout', () => {
                this.lineElement.stroke({width: 1, color: 'black'});
            });
            this.svgElement.on('mouseout', () => {
                this.lineElement.stroke({width: 1, color: 'black'});
            });
            if (this.posterior.context !== this.prior.context)
                this.positionChangedSubscription = this.posterior.context.positionChanged$.subscribe(() => this.rerenderLines());
            this.rerenderedSubscription = this.context.attachTo.root.lineViewRepo.rerendered$.pipe(
                filter(it => it === this.posterior.context.attachTo.id)
            ).subscribe(() => this.rerender());
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
                this.get(key).remove();
            }
            return super.delete(key);
        }
    }
}