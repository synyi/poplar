import {Line} from "../Line";
import {SVGNS} from "../../../../Infrastructure/SVGNS";
import {overLaps, TopContextUser} from "./TopContextUser";
import {ConnectionView} from "../../ConnectionView/ConnectionView";
import {assert} from "../../../../Infrastructure/Assert";
import {LabelView} from "../../LabelView/LabelView";


export class TopContext {
    public backgroundElement: SVGGElement = null as any;
    readonly belongTo: Line.ValueObject;
    public svgElement: SVGGElement = null as any;
    readonly children = new Set<TopContextUser>();

    constructor(
        belongTo: Line.ValueObject
    ) {
        this.belongTo = belongTo;
    }

    get layer(): number {
        return this.children.size === 0 ? 0 :
            Math.max(...Array.from(this.children).map(it => it.layer));
    }

    update() {
        this.children.forEach(it => it.update());

        Array.from(this.children)
            .filter(it => it instanceof LabelView.Entity)
            // @ts-ignore
            .map((labelView: LabelView.Entity) => {
                labelView.store.allConnections.forEach(storeConnection => {
                    if (this.belongTo.view.connectionViewRepository.has(storeConnection.id!)) {
                        const connectionView = this.belongTo.view.connectionViewRepository.get(storeConnection.id!);
                        if (connectionView.mayNotSameLineLabelView === labelView) {
                            connectionView.update();
                        }
                    }
                });
            });
    }

    render(): [SVGGElement, SVGGElement] {
        this.svgElement = document.createElementNS(SVGNS, 'g') as SVGGElement;
        this.backgroundElement = document.createElementNS(SVGNS, 'g') as SVGGElement;
        this.children.forEach(it => {
            this.renderChild(it);
        });
        this.update();
        return [this.svgElement, this.backgroundElement];
    }

    addChild(child: TopContextUser): number {
        const oldLayer = this.layer;
        let hasOverlapping = false;
        if (child instanceof ConnectionView.Entity) {
            child.layer = child.sameLineLabelView.layer;
        }
        do {
            ++child.layer;
            hasOverlapping = false;
            for (let otherEntity of this.children) {
                if (overLaps(child, otherEntity)) {
                    hasOverlapping = true;
                    break;
                }
            }
        } while (hasOverlapping);
        this.children.add(child);
        const newLayer = this.layer;
        return newLayer - oldLayer;
    }

    renderChild(child: TopContextUser) {
        assert(this.children.has(child));
        const childRenderResult = child.render();
        this.svgElement.appendChild(childRenderResult);
    }

    removeChild(child: TopContextUser) {
        assert(this.children.has(child));
        this.children.delete(child);
    }

    remove() {
        this.svgElement.remove();
        this.backgroundElement.remove();
    }
}
