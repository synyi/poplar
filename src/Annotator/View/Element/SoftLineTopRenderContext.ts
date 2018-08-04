import {Renderable} from "../Interface/Renderable";
import * as SVG from "svg.js";
import {fromEvent, Observable, Subscription} from "rxjs";

import {EventEmitter} from "events";
import {Destroyable} from "../../Public/Interface/Destroyable";
import {SoftLineTopPlaceUser} from "./Base/SoftLineTopPlaceUser";
import {assert} from "../../Tools/Assert";
import {SoftLine} from "./SoftLine";
import {filter, map} from "rxjs/operators";
import {Label} from "../../Store/Label";
import {LabelView} from "./LabelView";
import {Connection} from "../../Store/Connection";
import {InlineConnectionView} from "./ConnectionView/Inline/InlineConnectionView";
import {OutlineConnectionView} from "./ConnectionView/Outline/OutlineConnectionView";
import {OutlineConnectionViewManager} from "./ConnectionView/Outline/Manager";

export class SoftLineTopRenderContext extends EventEmitter implements Renderable, Destroyable {
    svgElement: SVG.G = null;
    heightChanged$: Observable<SoftLineTopRenderContext> = null;
    beforeRerender$: Observable<SoftLineTopRenderContext> = null;
    afterRerender$: Observable<SoftLineTopRenderContext> = null;
    elements: Set<SoftLineTopPlaceUser> = null;
    oldHeight = 0;
    labelAddedSubscription: Subscription = null;
    inlineConnectionAddedSubscription: Subscription = null;
    outlineConnectionAddedSubscription: Subscription = null;

    constructor(private attachToLine: SoftLine) {
        super();
        this.elements = new Set<SoftLineTopPlaceUser>();
        this.heightChanged$ = fromEvent(this, 'heightChanged');
        this.labelAddedSubscription = this.attachToLine.parent.store.labelAdded$.pipe(
            filter((it: Label) => this.isLabelInThisRange(it)),
            map((it: Label): LabelView => {
                return new LabelView(this.attachToLine, it);
            })
        ).subscribe(it => {
            this.addElement(it);
        });
        this.inlineConnectionAddedSubscription = Connection.constructed$.pipe(
            filter((it: Connection) => {
                let {fromLabelView, toLabelView} = this.connectionFromTo(it);
                return fromLabelView !== null && toLabelView !== null
            })
        ).subscribe((it: Connection) => {
            let {fromLabelView, toLabelView} = this.connectionFromTo(it);
            this.addElement(new InlineConnectionView(fromLabelView, toLabelView, it));
        });
        this.outlineConnectionAddedSubscription = Connection.constructed$.pipe(
            filter((it: Connection) => {
                let {fromLabelView, toLabelView} = this.connectionFromTo(it);
                return (fromLabelView !== null || toLabelView !== null) && !(fromLabelView !== null && toLabelView !== null);
            }),
        ).subscribe((it: Connection) => {
            let {fromLabelView, toLabelView} = this.connectionFromTo(it);
            let theView = OutlineConnectionViewManager.getConnectionViewBy(it);
            if (theView === null) {
                theView = new OutlineConnectionView(it);
                OutlineConnectionViewManager.addConnectionView(theView);
            }
            if (fromLabelView) {
                theView.from = fromLabelView;
            } else if (toLabelView) {
                theView.to = toLabelView;
            } else {
                assert(false);
            }
            if (theView.from !== null && theView.to !== null) {
                OutlineConnectionViewManager.removeConnectionView(theView);
                theView.render();
            }
        });
    }

    private connectionFromTo(it: Connection) {
        let fromLabelView: LabelView = null;
        let toLabelView: LabelView = null;
        for (let element of this.elements) {
            if (element instanceof LabelView) {
                if (element.store === it.from)
                    fromLabelView = element;
                if (element.store === it.to) {
                    toLabelView = element;
                }
            }
        }
        return {fromLabelView, toLabelView};
    }

    isLabelInThisRange(it: Label) {
        return this.attachToLine.startIndex <= it.startIndexIn(this.attachToLine.parent.store) && it.endIndexIn(this.attachToLine.parent.store) <= this.attachToLine.endIndex;
    }

    get height() {
        let maxLayer = 0;
        for (let element of this.elements) {
            if (maxLayer < element.layer) {
                maxLayer = element.layer;
            }
        }
        return maxLayer * 30;
    }

    render(context: SVG.Doc) {
        this.svgElement = context.group().back();
        this.oldHeight = this.height;
        this.elements.forEach(it => it.render(this.svgElement));
        this.emit('heightChanged', this);
    }

    layout() {
        if (this.svgElement) {
            let originY = (this.attachToLine.svgElement.node as any).getExtentOfChar(0).y;
            this.svgElement.y(originY - 5);
        }
    }

    addElement(element: SoftLineTopPlaceUser) {
        element.render(this.svgElement);
        this.elements.add(element);
        // element.destructed$.subscribe(() => this.rerender());
        if (this.oldHeight !== this.height) {
            this.oldHeight = this.height;
            this.emit('heightChanged', this);
        }
    }

    destructor() {
        this.elements.forEach(it => it.destructor());
        this.elements = null;
        if (this.svgElement) {
            this.svgElement.remove();
        }
        this.svgElement = null;
        this.heightChanged$ = null;
        this.labelAddedSubscription.unsubscribe();
        this.labelAddedSubscription = null;
        this.inlineConnectionAddedSubscription.unsubscribe();
        this.inlineConnectionAddedSubscription = null;
        this.outlineConnectionAddedSubscription.unsubscribe();
        this.outlineConnectionAddedSubscription = null;
    }
}