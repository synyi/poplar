import {Annotator} from "../../Annotator";
import {SVGNS} from "../../Infrastructure/SVGNS";
import {LabelView} from "../Entities/LabelView/LabelView";
import {none, Option, some} from "../../Infrastructure/Option";

export interface Config {
    readonly unconnectedLineStyle: "none" | "straight" | "curve";
}

export class TwoLabelsClickedHandler {
    lastSelection: Option<LabelView.Entity> = none;
    svgElement: SVGPathElement;

    constructor(public root: Annotator, private config: Config) {
        this.svgElement = document.createElementNS(SVGNS, 'path');
        this.svgElement.setAttribute("stroke", "#000000");
        this.svgElement.setAttribute("fill", "none");
        this.svgElement.style.markerEnd = "url(#marker-arrow)";
        this.root.on('labelClicked', (labelId: number) => {
            if (this.lastSelection.isSome) {
                this.root.emit('twoLabelsClicked', this.lastSelection.toNullable().id, labelId);
                this.svgElement.remove();
                this.svgElement.setAttribute("d", "");
                this.lastSelection = none;
            } else {
                this.lastSelection = some(this.root.view.labelViewRepository.get(labelId));
                this.root.view.svgElement.insertBefore(this.svgElement, this.root.view.svgElement.firstChild);
            }
        });
        this.root.view.svgElement.onmousemove = (e) => {
            this.lastSelection.map((fromLabelView: LabelView.Entity) => {
                const fromLeft = fromLabelView.labelLeft + 1;
                const fromRight = fromLabelView.labelRight - 1;
                const fromY = fromLabelView.globalY + 1;

                const toX = e.clientX - this.root.view.svgElement.getBoundingClientRect().left;
                const toY = e.clientY - this.root.view.svgElement.getBoundingClientRect().top;
                const fromX = (fromLeft + fromRight) / 2 < toX ? fromLeft : fromRight;

                if (config.unconnectedLineStyle === "straight") {
                    this.svgElement.setAttribute('d', `
                    M${fromX},${fromY}
                    L${toX},${toY}
                `);
                } else if (config.unconnectedLineStyle === "curve") {
                    let dx = (fromLeft - toX) / 4;
                    let y2 = Math.min(fromY, toY) - 20;

                    this.svgElement.setAttribute('d', `
                        M${fromX},${fromY}
                        C${fromX - dx},${y2},${toX + dx},${y2},${toX},${toY}
                    `);
                }
            });
        };
        this.root.view.svgElement.oncontextmenu = (e) => {
            this.lastSelection.map(() => {
                this.svgElement.remove();
                this.svgElement.setAttribute("d", "");
                this.lastSelection = none;
                e.preventDefault();
            })
        };
    }
}
