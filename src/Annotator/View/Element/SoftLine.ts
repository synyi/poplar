import {Renderable} from "../Interface/Renderable";
import * as SVG from "svg.js";
import {HardLine} from "./HardLine";
import {LabelView} from "./LabelView";
import {Label} from "../../Store/Label";
import {TextElement} from "./Base/TextElement";
import {SoftLineTopRenderContext} from "./SoftLineTopRenderContext";
import {InlineConnectionView} from "./InlineConnectionView";
import {OutlineConnectionManager} from "./OutlineConnection/OutlineConnectionManager";
import {OutlineConnection} from "./OutlineConnection/OutlineConnection";

export class SoftLine extends TextElement implements Renderable {
    static maxWidth = 80;
    parent: HardLine;
    next: SoftLine;
    svgElement: SVG.Tspan;
    topRenderContext = new SoftLineTopRenderContext(this);
    private _labelViews: Array<LabelView> = null;

    constructor(
        parent: HardLine,
        public startIndexInParent: number,
        public endIndexInParent: number
    ) {
        super(parent);
        this.topRenderContext.elements.push(...this.labelViews);
        this.topRenderContext.elements.push(...this.inlineConnections);
        this.arrangeOutlineConnections();
    }

    private _inlineConnections: Array<InlineConnectionView> = null;

    get labelViews() {
        if (this._labelViews === null) {
            this._labelViews = this.parent.store.getLabelsInRange(this.startIndexInParent, this.endIndexInParent)
                .map((label: Label) => {
                    return new LabelView(this, label);
                });
        }
        return this._labelViews;
    }

    get inlineConnections() {
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

    public layout() {
        this.topRenderContext.layout();
        this.labelViews.map(it => {
            it.onPositionChanged();
        });
    }

    get content() {
        return this.parent.store.slice(this.startIndexInParent, this.endIndexInParent).replace('\n', ' ');
    }

    render(context: SVG.Tspan) {
        this.svgElement = context.tspan(this.content).newLine();
        (this.svgElement as any).AnnotatorElement = this;
        this.renderTop();
    }

    rerender() {
        this.remove();
        this.svgElement.text(this.content).newLine();
        this.renderTop();
    }

    onRemove() {
        this.topRenderContext.remove();
        this.labelViews.map(it => it.onRemove());
        this._labelViews = null;
        this._inlineConnections = null;
    }

    private arrangeOutlineConnections() {
        for (let labelView of this.labelViews) {
            for (let connectionFrom of labelView.store.connectionsFromThis) {
                if (!(this.labelViews.find(it => it.store === connectionFrom.to))) {
                    let newConnection = new OutlineConnection(connectionFrom);
                    if (OutlineConnectionManager.addHalfCreatedConnection(newConnection)) {
                        newConnection.from = labelView;
                    }
                }
            }
            for (let connetionTo of labelView.store.connectionsToThis) {
                if (!(this.labelViews.find(it => it.store === connetionTo.from))) {
                    let newConnection = new OutlineConnection(connetionTo);
                    if (OutlineConnectionManager.addHalfCreatedConnection(newConnection)) {
                        newConnection.to = labelView;
                    }
                }
            }
        }
    }

    toGlobalIndex(index: number): number {
        return this.parent.store.toGlobalIndex(index + this.startIndexInParent);
    }

    private renderTop() {
        this.topRenderContext.render(this.svgElement.doc() as SVG.Doc);
        // everything in this line is in it's position now
        this.labelViews.map(it => {
            OutlineConnectionManager.onLabelViewReady(it);
        });

        // this.layoutAfterSelf();
    }
}