import {Renderable} from "../Interface/Renderable";
import * as SVG from "svg.js";
import {HardLine} from "./HardLine";
import {LabelView} from "./LabelView";
import {Label} from "../../Store/Label";
import {TextElement} from "./Base/TextElement";
import {SoftLineTopRenderContext} from "./SoftLineTopRenderContext";
import {InlineConnectionView} from "./InlineConnectionView";
import {Manager} from "./OutlineConnection/Manager";

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
        this.marginTopRenderContext.elements.push(...this.inlineConnections);
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

    _inlineConnections: Array<InlineConnectionView> = null;


    get inlineConnections() {
        if (this._inlineConnections === null) {
            this._inlineConnections = [];
            this.labelViews.map(fromLabelView => {
                for (let connection of fromLabelView.store.connectionsFromThis) {
                    let toLabelView = this.labelViews.find(it => it.store == connection.to);
                    if (toLabelView) {
                        this._inlineConnections.push(new InlineConnectionView(fromLabelView, toLabelView, connection))
                    } else {
                        Manager.addConnection(connection, fromLabelView);
                    }
                }
            });
            this.labelViews.map(toLabelView => {
                for (let connection of toLabelView.store.connectionsToThis) {
                    let fromLabelView = this.labelViews.find(it => it.store == connection.from);
                    if (fromLabelView) {

                    } else {
                        Manager.addConnection(connection, toLabelView);
                    }
                }
            });
            this.labelViews.map(labelView => {
                Manager.addLabel(labelView);
            });
        }
        return this._inlineConnections;
    }

    get content() {
        return this.parent.store.slice(this.startIndexInParent, this.endIndexInParent).replace('\n', ' ');
    }

    render(context: SVG.Tspan) {
        this.svgElement = context.tspan(this.content).newLine();
        (this.svgElement as any).AnnotatorElement = this;
        this.renderTop();
    }

    public layoutLabelRenderContext() {
        this.marginTopRenderContext.layout();
        this.labelViews.map(it => {
            Manager.rerenderIfNecessary(it);
        });
    }

    rerender(remove = true) {
        if (remove) {
            this.removeLabelViews();
        } else {
            this.labelViews.map(it => it.remove());
            this.inlineConnections.map(it => it.remove());
        }
        this.svgElement.clear();
        this.svgElement.text(this.content).newLine();
        this.renderTop();
    }

    removeLabelViews() {
        this.labelViews.map(it => it.remove());
        this.inlineConnections.map(it => it.remove());
        this._labelViews = null;
    }

    toGlobalIndex(index: number): number {
        return this.parent.store.toGlobalIndex(index + this.startIndexInParent);
    }

    private renderTop() {
        this.svgElement.dy(this.marginTopRenderContext.height + 20.8);
        this.marginTopRenderContext.render(this.svgElement.doc() as SVG.Doc);
        this.layoutLabelsRenderContextAfterSelf();
        Manager.renderIfPossible();
    }
}