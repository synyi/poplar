import {SoftLineTopPlaceUser} from "../../Base/SoftLineTopPlaceUser";
import * as SVG from "svg.js";
import {Renderable} from "../../../Interface/Renderable";
import {assert} from "../../../../Tools/Assert";
import {Connection} from "../../../../Store/Connection";
import {LabelView} from "../../LabelView";
import {merge} from "rxjs";

export class OutlineConnectionText extends SoftLineTopPlaceUser {
    svgElement: SVG.Text = null;

    constructor(private parent: OutlineConnectionView) {
        super(parent.higherLabel.context);
        this.parent.higherLabel.context.addElement(this);
    }

    get width(): number {
        if (!this.svgElement) {
            this.svgElement = this.context.svgElement.text(this.parent.store.text).size(12);
        }
        return this.svgElement.node.clientWidth;
    }

    get x(): number {
        let leftMost = this.parent.from.x < this.parent.to.x ? this.parent.from.x : this.parent.to.x;
        let rightMost = this.parent.from.x + this.parent.from.width;
        if (rightMost < this.parent.to.x + this.parent.to.width) {
            rightMost = this.parent.to.x + this.parent.to.width;
        }
        return (leftMost + rightMost - this.width) / 2;
    }

    get y(): number {
        return (this.layer) * -30 + 20.8;
    }

    _render(_: SVG.G) {
        assert(this.svgElement !== null);
        this.svgElement.x(this.x).y(this.y - 6);
    }

    initialLayer(): number {
        return this.parent.higherLabel.layer + 1;
    }
}

class OutlineConnectionLine implements Renderable {
    svgElement: SVG.Path;

    constructor(private parent: OutlineConnectionView) {
        merge(parent.from.attachedTo.afterLayout$, parent.to.attachedTo.afterLayout$).subscribe(() => this.rerender());
    }

    render() {
        let context = this.parent.from.svgElement.doc() as SVG.Doc;
        let from = this.parent.from.annotationElement.rbox(context);
        if (this.parent.from.x === this.parent.from.highlightElementBox.x) {
            from.x += (this.parent.from.annotationElementBox.container.x - this.parent.from.highlightElementBox.x);
            from.width -= (this.parent.from.annotationElementBox.container.x - this.parent.from.highlightElementBox.x) * 2;
        }
        let to = this.parent.to.annotationElement.rbox(context);
        if (this.parent.to.width === this.parent.to.highlightElementBox.width) {
            to.x += (this.parent.to.annotationElementBox.container.x - this.parent.to.highlightElementBox.x);
            to.width -= (this.parent.to.annotationElementBox.container.x - this.parent.to.highlightElementBox.x) * 2;
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
        this.parent.text.destructed$.subscribe(() => {
            this.svgElement.remove();
        });
    }

    private rerender() {
        this.svgElement.remove();
        this.render();
    }
}

export class OutlineConnectionView {
    text: OutlineConnectionText = null;
    line: OutlineConnectionLine = null;
    higherLabel: LabelView = null;

    constructor(public store: Connection) {
    }

    private _to: LabelView = null;

    get to(): LabelView {
        return this._to;
    }

    set to(value: LabelView) {
        this._to = value;
        if (this._to !== null) {
            if (this.from === null) {
                this.higherLabel = this._to;
            }
        }
    }

    private _from: LabelView = null;

    get from(): LabelView {
        return this._from;
    }

    set from(value: LabelView) {
        this._from = value;
        if (this._from !== null) {
            if (this.to === null) {
                this.higherLabel = this._from;
            }
        }
    }

    render() {
        this.text = new OutlineConnectionText(this);
        this.line = new OutlineConnectionLine(this);
        this.line.render();
    }
}