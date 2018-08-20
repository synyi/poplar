import {Store} from "../Store/Store";
import {RenderBehaviour} from "./Element/Root/RenderBehaviour/RenderBehaviour";
import {Root} from "./Element/Root/Root";
import * as SVG from "svg.js";
import {LabelView} from "./Element/LabelView";

export class View {
    root: Root = null;
    svgElement: SVG.Doc;
    cursorLine: SVG.Path = null;

    constructor(
        store: Store,
        htmlElement: HTMLElement,
        renderBehaviour: RenderBehaviour
    ) {
        this.root = new Root(store, renderBehaviour);
        this.svgElement = SVG(htmlElement);
        this.svgElement.style({"padding-left": "20px"});
        this.svgElement.size(1024, 768);
        this.root.render(this.svgElement);
        this.svgElement.size(this.svgElement.bbox().width + 50, this.svgElement.bbox().height + 50);
        this.root.sizeChanged$.subscribe(() => {
            this.svgElement.size(this.svgElement.bbox().width + 50, this.svgElement.bbox().height + 50);
        });
        this.svgElement.on('mousemove', (e) => {
            let bbox = this.svgElement.node.getBoundingClientRect() as DOMRect;
            if (this.cursorLine)
                this.cursorLine.remove();
            if (LabelView.activeLabelView !== null) {
                let startPositionX = LabelView.activeLabelView.annotationElementBox.container.x + LabelView.activeLabelView.annotationElementBox.container.width / 2;
                let startPositionY = LabelView.activeLabelView.annotationElementBox.container.y;
                // console.log(startPositionX, );
                // this.cursorLine = this.svgElement.path(
                //     `M   ${startPositionX} ${startPositionY + 2}
                //         L   ${e.clientX - bbox.x},${e.clientY - bbox.y}
                //             ${e.clientX - bbox.x},${e.clientY - bbox.y}`
                // ).stroke('black').back();
                // this.cursorLine.marker('end', 10, 10, function (add) {
                //     add.line(5, 5, -10, 8).stroke({width: 1.5});
                //     add.line(5, 5, -10, 2).stroke({width: 1.5});
                // });
            }
        });
    }
}