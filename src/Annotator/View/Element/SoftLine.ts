import {Renderable} from "../Interface/Renderable";
import * as SVG from "svg.js";
import {HardLine} from "./HardLine";
import {TextElement} from "./Base/TextElement";
import {SoftLineTopRenderContext} from "./SoftLineTopRenderContext";
import {of} from "rxjs";
import {LabelView} from "./LabelView";
import {Label} from "../../Store/Label";
import {InlineConnectionView} from "./InlineConnectionView";

export class SoftLine extends TextElement implements Renderable {
    static maxWidth = 80;
    parent: HardLine /*= null; in super*/;
    nextNode: SoftLine = null;
    svgElement: SVG.Tspan = null;
    topContext: SoftLineTopRenderContext = null;

    constructor(parent: HardLine,
                public startIndex: number,
                public endIndex: number) {
        super(parent);
        this.topContext = new SoftLineTopRenderContext(this);
        this.topContext.heightChanged$.subscribe(() => this.layout());
        this.labelViews.forEach(it => this.topContext.addElement(it));
        this.inlineConnections.forEach(it => this.topContext.addElement(it));
        this.constructed$ = of(this);
    }

    private _labelViews: Array<LabelView> = null;

    get labelViews() {
        if (this._labelViews === null) {
            this._labelViews = this.parent.store.getLabelsInRange(this.startIndex, this.endIndex)
                .map((label: Label) => {
                    return new LabelView(this, label);
                });
        }
        return this._labelViews;
    }

    private _inlineConnections: Array<InlineConnectionView> = null;

    get inlineConnections(): Array<InlineConnectionView> {
        if (this._inlineConnections === null) {
            this._inlineConnections = [];
            this.labelViews.map(fromLabelView => {
                for (let connection of fromLabelView.store.connectionsFromThis) {
                    let toLabelView = this.labelViews.find(it => it.store == connection.to);
                    if (toLabelView) {
                        this._inlineConnections.push(new InlineConnectionView(fromLabelView, toLabelView, connection))
                    }
                }
            });
        }
        return this._inlineConnections;
    }

    get content() {
        return this.parent.store.slice(this.startIndex, this.endIndex).replace('\n', ' ');
    }

    toGlobalIndex(index: number): number {
        return this.parent.store.toGlobalIndex(index + this.startIndex);
    }

    _render(context: SVG.Tspan) {
        this.svgElement = context.tspan(this.content).newLine();
        this.topContext.render(this.svgElement.doc() as SVG.Doc);
    }

    _layout() {
        this.svgElement.dy(this.topContext.height + 20.8);
        this.topContext.layout();
    }

    _destructor() {
        this.topContext.destructor();
    }
}