import {Store} from "../Store/Store";
import {Root} from "./Element/Root";
import * as SVG from "svg.js";
import {SelectionHandler} from "./SelectionHandler";
import {EventBus} from "../Tools/EventBus";
import {LabelAdded} from "../Store/Event/LabelAdded";

export class View {
    root: Root;

    constructor(store: Store,
                svgElement: HTMLElement) {
        this.root = new Root(store);
        let svgDoc = SVG(svgElement);
        this.root.render(svgDoc);
        this.resetDocSize(svgDoc);
        svgDoc.on("mouseup",
            SelectionHandler.textSelected);
        EventBus.on(LabelAdded.eventName, (info: LabelAdded) => {
            this.root.labelAdded(info);
            this.resetDocSize(svgDoc);
        });
    }

    private resetDocSize(svgDoc) {
        let boundingRect = this.root.svgElement.node.getBoundingClientRect();
        svgDoc.size(boundingRect.width + 20, boundingRect.height + 100);
    }
}