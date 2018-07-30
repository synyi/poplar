import {Renderable} from "../Interface/Renderable";
import * as SVG from "svg.js";
import {HardLine} from "./HardLine";
import {LabelView} from "./LabelView";
import {Label} from "../../Store/Label";
import {TextElement} from "./Base/TextElement";
import {SoftLineTopRenderContext} from "./SoftLineTopRenderContext";
import {InlineConnectionView} from "./InlineConnectionView";

export class SoftLine extends TextElement implements Renderable {
    static maxWidth = 80;
    parent: HardLine;
    next: SoftLine;
    svgElement: SVG.Tspan;
    marginTopRenderContext = new SoftLineTopRenderContext(this);

    constructor(
        parent: HardLine,
        public startIndexInParent: number,
        public endIndexInParent: number
    ) {
        super(parent);
        this.marginTopRenderContext.elements.push(...this.labelViews);
        this.marginTopRenderContext.elements.push(...this.connections);
    }


    _labelViews: Array<LabelView> = null;

    get labelViews() {
        if (this._labelViews === null) {
            this._labelViews = this.parent.store.getLabelsInRange(this.startIndexInParent, this.endIndexInParent)
                .map((label: Label) => {
                    return new LabelView(this, label);
                });
        }
        return this._labelViews;
    }

    _connections: Array<InlineConnectionView> = null;

    get connections() {
        if (this._connections === null) {
            this._connections = [];
            this.labelViews.map(fromLabelView => {
                for (let connection of fromLabelView.store.connectionsFromThis) {
                    let toLabelView = this.labelViews.find(it => it.store == connection.to);
                    if (toLabelView) {
                        this._connections.push(new InlineConnectionView(fromLabelView, toLabelView, connection))
                    }
                }
            });
        }
        return this._connections;
    }

    get content() {
        return this.parent.store.slice(this.startIndexInParent, this.endIndexInParent).replace('\n', ' ');
    }


    render(context: SVG.Tspan) {
        this.svgElement = context.tspan(this.content).newLine();
        (this.svgElement as any).AnnotatorElement = this;
        this.renderLabelViews();
    }

    public layoutLabelRenderContext() {
        this.marginTopRenderContext.layout()
    }

    rerender() {
        this.removeLabelViews();
        this.svgElement.text(this.content).newLine();
        this.renderLabelViews();
    }

    removeLabelViews() {
        this.labelViews.map(it => it.remove());
        this.connections.map(it => it.remove());
        this._labelViews = null;
    }

    toGlobalIndex(index: number): number {
        return this.parent.store.toGlobalIndex(index + this.startIndexInParent);
    }

    private renderLabelViews() {
        this.svgElement.dy(this.marginTopRenderContext.height + 20.8);
        this.marginTopRenderContext.render(this.svgElement.doc() as SVG.Doc);
        this.layoutLabelsRenderContextAfterSelf();
    }
}