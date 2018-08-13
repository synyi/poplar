import * as SVG from "svg.js";
import {ConnectionText} from "../ConnectionText";
import {merge, Subscription} from "rxjs";
import {ConnectionLine} from "./ConnectionLine";

export class OutlineConnectionLine extends ConnectionLine {
    private positionChangedSubscription: Subscription = null;

    constructor(text: ConnectionText) {
        super(text);
        this.positionChangedSubscription = merge(this.parent.from.view.context.positionChanged$, this.parent.to.view.context.positionChanged$)
            .subscribe(() => this.rerender());
    }

    render() {
        if (this.text.svgElement === null) {
            return;
        }
        let context = this.text.svgElement.doc() as SVG.Doc;
        let fromLabel = this.parent.from.view;
        let toLabel = this.parent.to.view;
        let from = fromLabel.annotationElement.rbox(context);
        if (fromLabel.x === fromLabel.highlightElementBox.x) {
            from.x += (fromLabel.annotationElementBox.container.x - fromLabel.highlightElementBox.x);
            from.width -= (fromLabel.annotationElementBox.container.x - fromLabel.highlightElementBox.x) * 2;
        }
        let to = toLabel.annotationElement.rbox(context);
        if (toLabel.width === toLabel.highlightElementBox.width) {
            to.x += (toLabel.annotationElementBox.container.x - toLabel.highlightElementBox.x);
            to.width -= (toLabel.annotationElementBox.container.x - toLabel.highlightElementBox.x) * 2;
        }
        let text = this.parent.text.svgElement.rbox(context);
        if (from.x < to.x) {
            this.svgElement = context.path(
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
            this.svgElement = context.path(
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
        this.svgElement.marker('end', 10, 10, function (add) {
            add.line(5, 5, -10, 8).stroke({width: 1.5});
            add.line(5, 5, -10, 2).stroke({width: 1.5});
        });
    }

    rerender() {
        if (this.svgElement)
            this.svgElement.remove();
        this.render();
    }

    _destructor() {
        if (this.svgElement)
            this.svgElement.remove();
        this.positionChangedSubscription.unsubscribe();
    }
}