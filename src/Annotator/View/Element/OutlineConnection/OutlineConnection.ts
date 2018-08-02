import {LabelView, LabelViewObserver} from "../LabelView";
import {Connection} from "../../../Store/Connection";
import * as SVG from "svg.js";
import {SoftLineTopPlaceUser} from "../Base/SoftLineTopPlaceUser";
import {Renderable} from "../../Interface/Renderable";
import {OutlineConnectionManager} from "./OutlineConnectionManager";
import {assert} from "../../../Tools/Assert";

class OutlineConnectionText extends SoftLineTopPlaceUser {
    svgElement: SVG.Text = null;

    constructor(private parent: OutlineConnection) {
        super(parent.higherLabel.context);
        this.parent.higherLabel.context.elements.push(this);
    }

    get width(): number {
        if (this.svgElement === null)
            this.svgElement = this.context.svgElement.text(this.parent.store.text).size(12);
        let textWidth = this.svgElement.bbox().width;
        return textWidth;
    }

    get x(): number {
        return (this.parent.from.x + this.parent.to.x) / 2;
    }

    get y(): number {
        return (this.layer) * -30 + 20.8;
    }

    render() {
        assert(!this.overlapping);
        if (this.overlapping) {
            this.eliminateOverLapping();
        }
        if (this.svgElement !== null) {
            this.svgElement.remove();
        }
        this.svgElement = this.context.svgElement.text(this.parent.store.text).size(12);
        this.svgElement.x(this.x).y(this.y - 6);
    }

    eliminateOverLapping() {
        this.layer = this.parent.higherLabel.layer + 1;
        super.eliminateOverLapping();
    }

    onRemove() {
    }

    remove() {
        this.context.elements.splice(this.context.elements.indexOf(this));
        this.context.rerender()
    }
}

class OutlineConnectionLine implements Renderable {
    svgElement: SVG.Path;

    constructor(private parent: OutlineConnection) {
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
    }

    rerender() {
        this.remove();
        this.render();
    }

    remove() {
        if (this.svgElement)
            this.svgElement.remove();
    }
}

export class OutlineConnection implements LabelViewObserver {
    text: OutlineConnectionText = null;
    line: OutlineConnectionLine = null;

    constructor(public store: Connection) {
    }

    private _to: LabelView = null;

    get to(): LabelView {
        return this._to;
    }

    set to(value: LabelView) {
        if (this._to) {
            this._to.observers.delete(this);
        }
        this._to = value;
        if (this._to) {
            this._to.observers.add(this);
        }
    }

    private _from: LabelView = null;

    get from(): LabelView {
        return this._from;
    }

    set from(value: LabelView) {
        if (this._from) {
            this._from.observers.delete(this);
        }
        this._from = value;
        if (this._from) {
            this._from.observers.add(this);
        }
    }

    get fullyConstructed(): Boolean {
        return this.from !== null && this.to !== null;
    }

    get higherLabel() {
        assert(this.fullyConstructed);
        return this._from.globalAnnotationElementBox.y < this._to.globalAnnotationElementBox.y ? this._from : this._to;
    }

    onLabelViewRemove(labelView: LabelView) {
        this.remove();
        if (labelView === this.from) {
            this.from = null;
        } else if (labelView === this.to) {
            this.to = null;
        } else {
            assert(false);
        }
        this.text = null;
        this.line = null;
        OutlineConnectionManager.addHalfCreatedConnection(this);
    }

    render() {
        this.text = new OutlineConnectionText(this);
        this.text.context.rerender();
        this.line = new OutlineConnectionLine(this);
        this.line.render();
    }

    onLabelViewPositionChanged(labelView: LabelView) {
        if (this.line) {
            this.line.remove();
            this.line = new OutlineConnectionLine(this);
            this.line.render();
        }
    }

    private remove() {
        if (this.text)
            this.text.remove();
        if (this.line)
            this.line.remove();
    }
}