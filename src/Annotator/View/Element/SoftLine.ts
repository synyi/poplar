import {Renderable} from "../Interface/Renderable";
import * as SVG from "svg.js";
import {HardLine} from "./HardLine";
import {TextElement} from "./Base/TextElement";
import {SoftLineTopRenderContext} from "./SoftLineTopRenderContext";
import {of, Subscription} from "rxjs";
import {LabelView} from "./LabelView";
import {Label} from "../../Store/Label";
import {InlineConnectionView} from "./ConnectionView/Inline/InlineConnectionView";
import {TextSelectionHandler} from "../TextSelectionHandler";
import {OutlineConnectionView} from "./ConnectionView/Outline/OutlineConnectionView";
import {OutlineConnectionViewManager} from "./ConnectionView/Outline/Manager";

export class SoftLine extends TextElement implements Renderable {
    static maxWidth = 80;
    parent: HardLine /*= null; in super*/;
    nextNode: SoftLine = null;
    svgElement: SVG.Tspan = null;
    topContext: SoftLineTopRenderContext = null;
    topContextHeightChangedSubscription: Subscription = null;

    constructor(parent: HardLine,
                public startIndex: number,
                public endIndex: number) {
        super(parent);
        this.topContext = new SoftLineTopRenderContext(this);
        this.topContextHeightChangedSubscription = this.topContext.heightChanged$.subscribe(() => {
            this.layout();
            this.layoutAfterSelf();
        });
        this.labelViews.forEach(it => this.topContext.elements.add(it));
        this.inlineConnections.forEach(it => this.topContext.elements.add(it));
        this.arrangeOutlineConnections();
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

    arrangeOutlineConnections() {
        this.labelViews.map(fromLabelView => {
            for (let connection of fromLabelView.store.connectionsFromThis) {
                let toLabelView = this.labelViews.find(it => it.store == connection.to);
                if (!toLabelView) {
                    let theView = OutlineConnectionViewManager.getConnectionViewBy(connection);
                    console.log('f', this.content);
                    if (theView === null) {
                        theView = new OutlineConnectionView(connection);
                        OutlineConnectionViewManager.addConnectionView(theView);
                    }
                    theView.from = fromLabelView;
                    if (theView.from !== null && theView.to !== null) {
                        this.afterRender$.subscribe(() => theView.render())
                    }
                }
            }
        });
        this.labelViews.map(toLabelView => {
            for (let connection of toLabelView.store.connectionsToThis) {
                let fromLabelView = this.labelViews.find(it => it.store == connection.from);
                if (!fromLabelView) {
                    let theView = OutlineConnectionViewManager.getConnectionViewBy(connection);
                    if (theView === null) {
                        theView = new OutlineConnectionView(connection);
                        OutlineConnectionViewManager.addConnectionView(theView);
                    }
                    theView.to = toLabelView;
                    if (theView.from !== null && theView.to !== null) {
                        this.afterRender$.subscribe(() => theView.render())
                    }
                }
            }
        });
    }


    get content() {
        return this.parent.store.slice(this.startIndex, this.endIndex).replace('\n', ' ');
    }

    toGlobalIndex(index: number): number {
        return this.parent.store.toGlobalIndex(index + this.startIndex);
    }

    _render(context: SVG.Tspan) {
        this.svgElement = context.tspan(this.content).newLine();
        this.svgElement.on('mouseup', () => {
            TextSelectionHandler.textSelected();
        });
        // for get the softline object from the dom
        // when dealing with Label adding, this is useful
        (this.svgElement as any).AnnotatorElement = this;
        this.topContext.render(this.svgElement.doc() as SVG.Doc);
    }

    _layout() {
        this.svgElement.dy(this.topContext.height + 20.8);
        this.topContext.layout();
    }

    _destructor() {
        this.topContext.destructor();
        this.topContextHeightChangedSubscription.unsubscribe();
    }
}