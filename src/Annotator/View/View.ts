import {Store} from "../Store/Store";
import * as SVG from "svg.js";
import {TextSelectionHandler} from "./TextSelectionHandler";
import {EventBus} from "../Tools/EventBus";
import {LabelAdded} from "../Store/Event/LabelAdded";
import {Root} from "./Element/Root/Root";
import {RenderBehaviour} from "./Element/Root/RenderBehaviour/RenderBehaviour";
import {ConnectionAdded} from "../Store/Event/ConnectionAdded";

export class View {
    root: Root;
    width: number;
    height: number;
    svgElement: SVG.Doc;

    constructor(store: Store,
                svgElement: HTMLElement,
                renderBehaviour: RenderBehaviour) {
        this.root = new Root(store, renderBehaviour);
        let svgDoc = SVG(svgElement);
        (svgDoc as any).resize = () => {
            const boundingRect = this.root.svgElement.node.getBoundingClientRect();
            if (this.height < boundingRect.height + 100) {
                this.height = boundingRect.height + 100;
            }
            if (this.width < boundingRect.width + 20) {
                this.width = boundingRect.width + 20;
            }
            svgDoc.size(this.width, this.height);
        };
        this.svgElement = svgDoc;
        this.root.render(svgDoc);
        let boundingRect = this.root.svgElement.node.getBoundingClientRect();
        this.width = boundingRect.width + 20;
        this.height = boundingRect.height + 100;
        svgDoc.on("mouseup", TextSelectionHandler.textSelected);
        (svgDoc as any).resize();
        EventBus.on(LabelAdded.eventName, (info: LabelAdded) => {
            this.root.labelAdded(info);
            this.height += 30;
            (svgDoc as any).resize();
        });
        EventBus.on(ConnectionAdded.eventName, (info: ConnectionAdded) => {
            Root.connectionAdded(info);
        })
    }
}