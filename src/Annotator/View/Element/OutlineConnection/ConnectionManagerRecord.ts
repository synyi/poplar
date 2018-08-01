import {LabelView} from "../LabelView";
import {Connection} from "../../../Store/Connection";
import {TextPart} from "./TextPart";
import {LinePart} from "./LinePart";
import {SoftLineTopRenderContext} from "../SoftLineTopRenderContext";
import {Doc} from "svg.js";

export class ConnectionManagerRecord {
    context: SoftLineTopRenderContext = null;
    from: LabelView = null;
    to: LabelView = null;
    text: TextPart = null;
    line: LinePart = null;

    constructor(public store: Connection, addBy: LabelView) {
        if (addBy.store === store.from) {
            this.from = addBy;
            this.context = this.from.context;
        } else {
            this.to = addBy;
            this.context = this.to.context;
        }
    }

    get ready() {
        return !(this.from === null || this.to === null);
    }

    render() {
        if (!this.ready) {
            throw Error('Not ready to render yet!');
        }
        this.text = new TextPart(this.context, this.from, this.to, this.store);
        this.text.context.attachToLine.rerender(false);
        this.line = new LinePart(this.from, this.to, this.text);
        this.line.render(this.context.svgElement.doc() as Doc);
    }

    rerender() {
        this.line.remove();
        this.line = new LinePart(this.from, this.to, this.text);
        this.line.render(this.context.svgElement.doc() as Doc);
    }

    remove() {
        this.text.remove();
        this.line.remove();
    }
}