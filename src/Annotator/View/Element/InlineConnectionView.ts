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
        let textWidth = this.textElement.node.clientWidth;
        // firefox refuse to put the element's width in its clientWidth
        // bad for it
        if (textWidth === 0) {
            textWidth = this.textElement.node.getBoundingClientRect().width;
        }
        return textWidth;
    }

    get x(): number {
        let x1 = this.from.x;
        let x2 = this.to.x;
        return (x1 + x2) / 2;
    }

    get y(): number {
        return (this.layer) * -30 + 20.8;
    }

    render(context: SVG.G) {
        let y = this.y;
        this.svgElement = context.group().back();
        if (this.from.x < this.to.x) {
            this.connectionElement = context.path(
                `
                M ${this.from.x}                        ${this.from.y - 20.8}
                C ${this.from.x - 10}                   ${y},
                  ${this.from.x - 10}                   ${y},
                  ${this.from.x}                        ${y}
                L ${this.x}                             ${y}
                M ${this.x + this.width}                ${y}
                L ${this.to.x + this.to.width}          ${y}
                C ${this.to.x + this.to.width + 10}     ${y},
                  ${this.to.x + this.to.width + 10}     ${y},
                  ${this.to.x + this.to.width}          ${this.to.y - 20.8}
                `).stroke('black').fill('transparent');
        } else {
            this.connectionElement = context.path(
                `
                M ${this.from.x + this.from.width}      ${this.from.y - 20.8}
                C ${this.from.x + this.from.width + 10} ${y},
                  ${this.from.x + this.from.width + 10} ${y},
                  ${this.from.x + this.from.width}      ${y}
                L ${this.x + this.width}                ${y}
                M ${this.x}                             ${y}
                L ${this.to.x }                         ${y}
                C ${this.to.x - 10}                     ${y},
                  ${this.to.x - 10}                     ${y},
                  ${this.to.x}                          ${this.to.y - 20.8}
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

    rerender() {
    }

    eliminateOverLapping() {
        this.layer = this.from.layer;
        if (this.layer < this.to.layer)
            this.layer = this.to.layer;
        super.eliminateOverLapping();
    }

    remove() {
        this.svgElement.clear();
    }
}