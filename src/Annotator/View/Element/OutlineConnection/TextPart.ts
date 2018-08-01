import {SoftLineMarginTopPlaceUser} from "../Base/SoftLineMarginTopPlaceUser";
import {LabelView} from "../LabelView";
import {SoftLineTopRenderContext} from "../SoftLineTopRenderContext";
import * as SVG from "svg.js";
import {Connection} from "../../../Store/Connection";

export class TextPart extends SoftLineMarginTopPlaceUser {
    svgElement: SVG.Text = null;

    constructor(context: SoftLineTopRenderContext,
                public from: LabelView,
                public to: LabelView,
                public store: Connection) {
        super(context);
        context.elements.push(this);
    }

    get width(): number {
        if (this.svgElement === null)
            this.svgElement = (this.context.svgElement.doc() as SVG.Doc).text(this.store.text)
                .font({size: 12});
        let textWidth = this.svgElement.node.clientWidth;
        // firefox refuse to put the element's width in its clientWidth
        // bad for it
        if (textWidth === 0) {
            textWidth = this.svgElement.node.getBoundingClientRect().width;
        }
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
        this.context.elements.push(this);
        this.context.svgElement.put(this.svgElement);
        this.svgElement.x(this.x).y(this.y - 6);
    }

    eliminateOverLapping() {
        if (this.context.elements.indexOf(this.from) !== -1) {
            this.layer = this.from.layer + 1;
        } else {
            this.layer = this.to.layer + 1;
        }
        super.eliminateOverLapping();
    }

    remove() {
        this.svgElement.remove();
    }
}