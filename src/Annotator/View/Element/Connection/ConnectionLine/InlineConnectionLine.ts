import {ConnectionLine} from "./ConnectionLine";
import {ConnectionText} from "../ConnectionText";

export class InlineConnectionLine extends ConnectionLine {
    constructor(text: ConnectionText) {
        super(text);
    }

    get y(): number {
        return this.text.y;
    }

    render() {
        let context = this.text.context.svgElement;
        let y = this.y;
        let fromX = this.text.from.annotationElementBox.container.x;
        let toX = this.text.to.annotationElementBox.container.x;
        let fromWidth = this.text.from.annotationElementBox.container.width;
        let toWidth = this.text.to.annotationElementBox.container.width;
        if (fromX < toX) {
            this.svgElement = context.path(
                `
                M ${fromX}                  ${this.text.from.y - 20.8}
                C ${fromX - 10}             ${y},
                  ${fromX - 10}             ${y},
                  ${fromX}                  ${y}
                L ${this.text.x}            ${y}
                M ${this.text.x + this.text.width} ${y}
                L ${toX + toWidth}          ${y}
                C ${toX + toWidth + 10}     ${y},
                  ${toX + toWidth + 10}     ${y},
                  ${toX + toWidth}          ${this.text.to.y - 20.8}
                `).stroke('black').fill('transparent');
        } else {
            this.svgElement = context.path(
                `
                M ${fromX + fromWidth}      ${this.text.from.y - 20.8}
                C ${fromX + fromWidth + 10} ${y},
                  ${fromX + fromWidth + 10} ${y},
                  ${fromX + fromWidth}      ${y}
                L ${this.text.x + this.text.width}    ${y}
                M ${this.text.x}                 ${y}
                L ${toX}                    ${y}
                C ${toX - 10}               ${y},
                  ${toX - 10}               ${y},
                  ${toX}                    ${this.text.to.y - 20.8}
                `).stroke('black').fill('transparent');
        }
        this.svgElement.marker('end', 10, 10, function (add) {
            add.line(5, 5, -10, 8).stroke({width: 1.5});
            add.line(5, 5, -10, 2).stroke({width: 1.5});
        });
        this.svgElement.toParent(this.text.svgElement);
        this.svgElement.back();
    }
}