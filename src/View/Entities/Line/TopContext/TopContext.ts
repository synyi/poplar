import {Option, some} from "../../../../Infrastructure/Option";
import {Line} from "../Line";
import {SVGNS} from "../../../../Infrastructure/SVGNS";
import {overLaps, TopContextUser} from "./TopContextUser";
import {ConnectionView} from "../../ConnectionView/ConnectionView";


export class TopContext {
    public backgroundElement: SVGGElement;
    readonly belongTo: Line.Entity;
    private svgElement: Option<SVGGElement>;
    private children = new Set<TopContextUser>();

    constructor(
        belongTo: Line.Entity
    ) {
        this.belongTo = belongTo;
    }

    get layer(): number {
        return this.children.size === 0 ? 0 :
            Math.max(...Array.from(this.children).map(it => it.layer));
    }

    update() {
        this.children.forEach(it => it.update());
    }

    render(): [SVGGElement, SVGGElement] {
        this.svgElement = some(document.createElementNS(SVGNS, 'g') as SVGGElement);
        this.backgroundElement = document.createElementNS(SVGNS, 'g') as SVGGElement;
        this.svgElement.map(element => {
            this.children.forEach(it => {
                element.appendChild(it.render());
            });
        });
        this.update();
        return [this.svgElement.toNullable(), this.backgroundElement];
    }

    addChildren(child: TopContextUser) {
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
    }
}
