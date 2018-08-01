import {SoftLineMarginTopPlaceUser} from "./Base/SoftLineMarginTopPlaceUser";
import * as SVG from "svg.js";
import {LabelView} from "./LabelView";
import {Connection} from "../../Store/Connection";

export class InlineConnectionView extends SoftLineMarginTopPlaceUser {
    textElement: SVG.Text = null;
    svgElement: SVG.G;
    connectionElement: SVG.Path;

    constructor(public from: LabelView,
                public to: LabelView,
                public store: Connection) {
        super(from.attachedTo.marginTopRenderContext)
    }

    get width(): number {
        if (this.textElement === null)
            this.textElement = (this.from.attachedTo.svgElement.doc() as SVG.Doc).text(this.store.text)
                .font({size: 12});
        // let textWidth = this.textElement.node.clientWidth;
        // WTF?!
        // clientWidth sometimes give a number larger than expected!!!
        let textWidth = this.textElement.node.getBoundingClientRect().width;
        return textWidth;
    }

    get x(): number {
        let x1 = this.from.annotationElementBox.container.x;
        let x2 = this.to.annotationElementBox.container.x;
        return (x1 + x2) / 2;
    }

    get y(): number {
        return (this.layer) * -30 + 20.8;
    }

    render() {
        let context = this.context.svgElement;
        let y = this.y;
        this.svgElement = context.group().back();
        let fromX = this.from.annotationElementBox.container.x;
        let toX = this.to.annotationElementBox.container.x;
        let fromWidth = this.from.annotationElementBox.container.width;
        let toWidth = this.to.annotationElementBox.container.width;
        if (fromX < toX) {
            this.connectionElement = context.path(
                `
                M ${fromX}                  ${this.from.y - 20.8}
                C ${fromX - 10}             ${y},
                  ${fromX - 10}             ${y},
                  ${fromX}                  ${y}
                L ${this.x}                 ${y}
                M ${this.x + this.width}    ${y}
                L ${toX + toWidth}          ${y}
                C ${toX + toWidth + 10}     ${y},
                  ${toX + toWidth + 10}     ${y},
                  ${toX + toWidth}          ${this.to.y - 20.8}
                `).stroke('black').fill('transparent');
        } else {
            this.connectionElement = context.path(
                `
                M ${fromX + fromWidth}      ${this.from.y - 20.8}
                C ${fromX + fromWidth + 10} ${y},
                  ${fromX + fromWidth + 10} ${y},
                  ${fromX + fromWidth}      ${y}
                L ${this.x + this.width}    ${y}
                M ${this.x}                 ${y}
                L ${toX}                    ${y}
                C ${toX - 10}               ${y},
                  ${toX - 10}               ${y},
                  ${toX}                    ${this.to.y - 20.8}
                `).stroke('black').fill('transparent');
        }
        this.connectionElement.marker('end', 10, 10, function (add) {
            add.line(5, 5, -10, 8).stroke({width: 1.5});
            add.line(5, 5, -10, 2).stroke({width: 1.5});
        });
        this.svgElement.put(this.connectionElement);
        this.svgElement.put(this.textElement);
        this.textElement.x(this.x).y(this.y - 6);
    }

    eliminateOverLapping() {
        this.layer = this.from.layer;
        if (this.layer < this.to.layer)
            this.layer = this.to.layer;
        ++this.layer;
        super.eliminateOverLapping();
    }

    remove() {
        this.svgElement.clear();
        this.textElement = null;
    }
}