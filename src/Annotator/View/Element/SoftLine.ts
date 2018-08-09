import {TextElement} from "../Base/TextElement";
import * as SVG from "svg.js";
import {HardLine} from "./HardLine";
import {assert} from "../../Common/Tools/Assert";
import {Subscription} from "rxjs";
import {SoftLineTopRenderContext} from "./SoftLineTopRenderContext";
import {TextSelectionHandler} from "../TextSelectionHandler";

export class SoftLine extends TextElement {
    static maxWidth = 80;
    svgElement: SVG.Tspan/* = null; in base*/;
    parent: HardLine/*=null; in base*/;
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
    }

    get globalStartIndex(): number {
        if (this.destructed) {
            console.warn('try to get globalStartIndex on a destructed softline, ' +
                'this should not be happened, though it won\'t cause any obvious problem.' +
                'We\'ll fix it next version if possible');
            return -1;
        }
        return this.parent.store.toGlobalIndex(this.startIndex);
    }

    get globalEndIndex(): number {
        if (this.destructed) {
            console.warn('try to get globalEndIndex on a destructed softline, ' +
                'this should not be happened, though it won\'t cause any obvious problem.' +
                'We\'ll fix it next version if possible');
            return -1;
        }
        return this.parent.store.toGlobalIndex(this.endIndex);
    }

    get content() {
        return this.parent.store.slice(this.startIndex, this.endIndex).replace('\n', ' ');
    }

    render(context: SVG.Tspan) {
        assert(this.svgElement === null);
        this.svgElement = context.tspan(this.content).newLine();
        this.svgElement.on('mouseup', () => {
            TextSelectionHandler.textSelected();
        });
        // for get the softline object from the dom
        // when dealing with Label adding, this is useful
        (this.svgElement as any).AnnotatorElement = this;
        this.topContext.render(this.svgElement.doc() as SVG.Doc);
    }

    layoutSelf() {
        this.svgElement.dy(this.topContext.height + 20.8);
        this.topContext.layout();
    }

    _destructor() {
        this.topContext.destructor();
        (this.svgElement as any).AnnotatorElement = null;
        super._destructor();
    }
}