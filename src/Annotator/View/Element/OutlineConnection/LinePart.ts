import {LabelView} from "../LabelView";
import {TextPart} from "./TextPart";
import * as SVG from "svg.js";

export class LinePart {
    element: SVG.Path;

    constructor(
        public from: LabelView,
        public to: LabelView,
        public text: TextPart
    ) {
    }

    render(context: SVG.Doc) {
        let from = this.from.annotationElement.rbox(context);
        if (this.from.x === this.from.highlightElementBox.x) {
            from.x += (this.from.annotationElementBox.container.x - this.from.highlightElementBox.x);
            from.width -= (this.from.annotationElementBox.container.x - this.from.highlightElementBox.x) * 2;
        }
        let to = this.to.annotationElement.rbox(context);
        if (this.to.width === this.to.highlightElementBox.width) {
            to.x += (this.to.annotationElementBox.container.x - this.to.highlightElementBox.x);
            to.width -= (this.to.annotationElementBox.container.x - this.to.highlightElementBox.x) * 2;
        }
        let text = this.text.svgElement.rbox(context);
        if (from.x < to.x) {
            this.element = context.path(
                `
                M ${from.x}               ${from.y}
                C ${from.x - 10}          ${text.y + text.height / 2},
                  ${from.x - 10}          ${text.y + text.height / 2},
                  ${from.x}               ${text.y + text.height / 2}
                L ${text.x}               ${text.y + text.height / 2}
                M ${text.x + text.width}  ${text.y + text.height / 2}
                L ${to.x + to.width}      ${text.y + text.height / 2}
                C ${to.x + to.width + 10} ${text.y + text.height / 2},
                  ${to.x + to.width + 10} ${text.y + text.height / 2},
                  ${to.x + to.width}      ${to.y}
                `).stroke('black').fill('transparent').back();
        } else {
            this.element = context.path(
                `
                M ${from.x + from.width}      ${from.y}
                C ${from.x + from.width + 10} ${text.y + text.height / 2},
                  ${from.x + from.width + 10} ${text.y + text.height / 2},
                  ${from.x + from.width}      ${text.y + text.height / 2}
                L ${text.x + text.width}      ${text.y + text.height / 2}
                M ${text.x}                   ${text.y + text.height / 2}
                L ${to.x}                     ${text.y + text.height / 2}
                C ${to.x - 10}                ${text.y + text.height / 2},
                  ${to.x - 10}                ${text.y + text.height / 2},
                  ${to.x}                     ${to.y}
                `).stroke('black').fill('transparent').back();
        }
        this.element.marker('end', 10, 10, function (add) {
            add.line(5, 5, -10, 8).stroke({width: 1.5});
            add.line(5, 5, -10, 2).stroke({width: 1.5});
        });
    }

    remove() {
        this.element.remove();
    }
}