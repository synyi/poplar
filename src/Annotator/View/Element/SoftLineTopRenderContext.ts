import {Destructable} from "../../Common/Base/Destructable";
import {Renderable} from "../Interface/Renderable";
import * as SVG from "svg.js";
import {fromEvent, Observable} from "rxjs";
import {SoftLineTopPlaceUser} from "../Base/SoftLineTopPlaceUser";
import {assert} from "../../Common/Tools/Assert";
import {Label} from "../../Store/Element/Label/Label";
import {SoftLine} from "./SoftLine";
import {LabelView} from "./LabelView";
import {Store} from "../../Store/Store";
import {filter} from "rxjs/operators";

export class SoftLineTopRenderContext extends Destructable implements Renderable {
    svgElement: SVG.G = null;
    heightChanged$: Observable<null> = null;
    positionChanged$: Observable<null> = null;
    elements: Set<SoftLineTopPlaceUser> = new Set<SoftLineTopPlaceUser>();
    oldHeight = 0;

    constructor(public attachTo: SoftLine) {
        super();
        this.heightChanged$ = fromEvent(this, 'heightChanged');
        this.positionChanged$ = fromEvent(this, 'positionChanged');
        Store.labelAdded$.pipe(
            filter(label => this.attachTo.globalStartIndex <= label.startIndex && label.endIndex <= this.attachTo.globalEndIndex)
        ).subscribe(it => {
            if (this.svgElement === null) {
                this.render(this.attachTo.svgElement.doc() as SVG.Doc);
            } else {
                this.addElement(new LabelView(it, this));
                this.renderUnrendered();
            }
        });
    }

    addElement(element: SoftLineTopPlaceUser) {
        this.elements.add(element);
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
        assert(this.svgElement === null);
        let labelViews = this.getLabelViews();
        if (labelViews.size !== 0) {
            this.svgElement = context.group().back();
            labelViews.forEach(it => this.addElement(it));
            let thisRoundRenderCount: number;
            do {
                thisRoundRenderCount = 0;
                for (let element of this.elements) {
                    if (!element.rendered && element.readyToRender) {
                        element.render(this.svgElement);
                        ++thisRoundRenderCount;
                    }
                }
            } while (thisRoundRenderCount !== 0);
            this.oldHeight = this.height;
            this.emit('heightChanged');
        }
    }

    _destructor() {
        this.elements.forEach(it => it.destructor());
        if (this.svgElement)
            this.svgElement.clear();
        this.svgElement = null;
        this.heightChanged$ = null;
        this.oldHeight = null;
    }

    layout() {
        if (this.svgElement) {
            let oldY = this.svgElement.y();
            let originY = (this.attachTo.svgElement.node as any).getExtentOfChar(0).y;
            this.svgElement.y(originY - 5);
            if (originY - 5 !== oldY) {
                this.emit('positionChanged');
            }
        }
    }

    renderUnrendered() {
        let thisRoundRenderCount: number;
        do {
            thisRoundRenderCount = 0;
            for (let element of this.elements) {
                if (!element.rendered && element.readyToRender) {
                    element.render(this.svgElement);
                    ++thisRoundRenderCount;
                }
            }
        } while (thisRoundRenderCount !== 0);
        if (this.oldHeight !== this.height) {
            this.oldHeight = this.height;
            this.emit('heightChanged');
        }
    }

    private getLabelViews(): Set<LabelView> {
        let result = new Set<LabelView>();
        for (let label of Label.all) {
            if (this.attachTo.globalStartIndex <= label.startIndex && label.endIndex <= this.attachTo.globalEndIndex) {
                let newLabelView = new LabelView(label, this);
                result.add(newLabelView);
            }
        }
        return result;
    }
}