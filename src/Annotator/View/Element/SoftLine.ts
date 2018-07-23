import {AnnotatorTextElement} from "./Base/AnnotatorTextElement";
import {Sentence} from "../../Store/Sentence";
import {HardLine} from "./HardLine";
import * as SVG from "svg.js";
import {Label} from "../../Store/Label";
import {LabelView} from "./LabelView";

export class SoftLine extends AnnotatorTextElement {
    static maxWidth = 80;
    parent: HardLine;
    store: Sentence;
    svgElement: SVG.Tspan;
    labelsRenderContext: SVG.G;
    labelViews: Array<LabelView>;

    constructor(store: Sentence,
                parent: HardLine,
                private startIndex: number,
                private endIndex: number) {
        super(store, parent);
    }

    render(context: SVG.Tspan) {
        this.labelViews = this.ancestorStore.getLabelsInRange(
            this.startIndex + this.store.startIndexInAncestor,
            this.endIndex + this.store.startIndexInAncestor)
            .map((label: Label) => {
                return new LabelView(label, this);
            });
        this.svgElement = context.tspan(this.content).newLine();
        (this.svgElement as any).AnnotatorElement = this;
        this.labelsRenderContext = (this.svgElement.doc() as SVG.Doc).group().back();
        this.layout();
        this.layoutLabelRenderContext();
        this.layoutLabelsRenderContextAfterSelf();
        this.labelViews.map(it => it.render(this.labelsRenderContext));
    }


    layoutLabelRenderContext() {
        let originY = (this.svgElement.node as any).getExtentOfChar(0).y;
        this.labelsRenderContext.y(originY - 5);
    }

    layoutLabelsRenderContextAfterSelf() {
        let nextSoftLine = this;
        while (nextSoftLine.next) {
            nextSoftLine.next.layoutLabelRenderContext();
            nextSoftLine = nextSoftLine.next;
        }
        nextSoftLine.parent.layoutLabelsRenderContextAfterSelf();
    }

    layout() {
        this.svgElement.dy(30 * this.marginTop + 20.8);
    }

    get content() {
        return this.store.slice(this.startIndex, this.endIndex).replace('\n', ' ');
    }

    get marginTop() {
        if (this.labelViews.length === 0)
            return 0;
        this.labelViews.map(it => it.eliminateOverLapping());
        return Math.max(...this.labelViews.map(it => it.layer));
    }

    toGlobalIndex(localIndex: number) {
        let indexInHardLine = localIndex + this.startIndex;
        return indexInHardLine + this.parent.store.startIndexInAncestor;
    }

    remove() {
        this.labelViews.map(it => it.remove());
        this.labelsRenderContext.remove();
        // this.svgElement.remove();
    }
}