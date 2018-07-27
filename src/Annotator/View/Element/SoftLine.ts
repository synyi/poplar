import {Renderable} from "../Interface/Renderable";
import * as SVG from "svg.js";
import {HardLine} from "./HardLine";
import {LabelView} from "./LabelView";
import {Label} from "../../Store/Label";
import {TextElement} from "./Base/TextElement";

export class SoftLine extends TextElement implements Renderable {
    static maxWidth = 80;
    parent: HardLine;
    next: SoftLine;
    svgElement: SVG.Tspan;

    constructor(
        parent: HardLine,
        public startIndexInParent: number,
        public endIndexInParent: number
    ) {
        super(parent);
    }

    labelsRenderContext: SVG.G;

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

    get content() {
        return this.parent.store.slice(this.startIndexInParent, this.endIndexInParent).replace('\n', ' ');
    }

    private get marginTop() {
        if (this.labelViews.length === 0)
            return 0;
        return Math.max(...this.labelViews.map(it => it.layer));
    }

    render(context: SVG.Tspan) {
        this.svgElement = context.tspan(this.content).newLine();
        (this.svgElement as any).AnnotatorElement = this;
        this.renderLabelViews();
    }

    public layoutLabelRenderContext() {
        if (this.labelViews.length !== 0) {
            let originY = (this.svgElement.node as any).getExtentOfChar(0).y;
            this.labelsRenderContext.y(originY - 5);
        }
    }

    rerender() {
        this.removeLabelViews();
        this.svgElement.text(this.content).newLine();
        this.renderLabelViews();
    }

    removeLabelViews() {
        this.labelViews.map(it => it.remove());
        this._labelViews = null;
    }


    toGlobalIndex(index: number): number {
        return this.parent.store.toGlobalIndex(index + this.startIndexInParent);
    }

    private renderLabelViews() {
        this.labelsRenderContext = (this.svgElement.doc() as SVG.Doc).group().back();
        this.labelViews.map(it => it.eliminateOverLapping());
        this.svgElement.dy(30 * this.marginTop + 20.8);
        this.layoutLabelRenderContext();
        this.layoutLabelsRenderContextAfterSelf();
        this.labelViews.map(it => it.render(this.labelsRenderContext));
    }
}