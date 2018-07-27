import {Store} from "../Store/Store";
import {OneShotRoot} from "./Element/Root/OneShotRoot";
import * as SVG from "svg.js";
import {SelectionHandler} from "./SelectionHandler";
import {EventBus} from "../Tools/EventBus";
import {LabelAdded} from "../Store/Event/LabelAdded";
import {Root} from "./Element/Root/Root";
import {LazyRoot} from "./Element/Root/LazyRoot";

export enum RenderMode {
    OneShot,
    Lazy
}

export class View {
    root: Root;
    width: number;
    height: number;
    svgElement: SVG.Doc;

    constructor(store: Store,
                svgElement: HTMLElement, mode: RenderMode) {
        switch (mode) {
            case RenderMode.Lazy:
                this.root = new LazyRoot(store);
                break;
            case RenderMode.OneShot:
                this.root = new OneShotRoot(store);
        }
        let svgDoc = SVG(svgElement);
        this.svgElement = svgDoc;
        this.root.render(svgDoc);
        let boundingRect = this.root.svgElement.node.getBoundingClientRect();
        this.width = boundingRect.width + 20;
        this.height = boundingRect.height + 100;
        this.resetDocSize(svgDoc);
        svgDoc.on("mouseup",
            SelectionHandler.textSelected);
        EventBus.on(LabelAdded.eventName, (info: LabelAdded) => {
            this.root.labelAdded(info);
            this.height += 30;
            this.resetDocSize(svgDoc);
        });
    }

    private resetDocSize(svgDoc) {
        if (this.height < this.root.svgElement.node.getBoundingClientRect().height + 100) {
            this.height = this.root.svgElement.node.getBoundingClientRect().height + 100;
        }
        svgDoc.size(this.root.svgElement.node.getBoundingClientRect().width + 20,
            this.height);
    }
}