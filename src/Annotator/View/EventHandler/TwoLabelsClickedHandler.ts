import {Annotator} from "../../Annotator";

export class TwoLabelsClickedHandler {
    lastSelection = null;
    svgElement = null;
    markerElement = null;

    constructor(public root: Annotator) {
        this.root.on('labelClicked', (id: number) => {
            if (this.lastSelection === null) {
                this.lastSelection = id;
                this.svgElement = this.root.view.svgDoc.path(`M0 0L0 0`).stroke('black');
                this.markerElement = this.svgElement.marker('end', 5, 5, add => {
                    add.polyline('0,0 5,2.5 0,5 0.2,2.5');
                });
            } else {
                this.root.emit('twoLabelsClicked', this.lastSelection, id);
                this.svgElement.remove();
                this.svgElement = null;
                this.lastSelection = null;
            }
        });
        this.root.view.svgDoc.on('mousemove', (e) => {
            if (this.svgElement !== null) {
                this.markerElement.remove();
                this.svgElement.remove();
                const fromLabelView = this.root.view.labelViewRepo.get(this.lastSelection);
                const fromX = fromLabelView.globalX - this.root.view.svgDoc.node.getBoundingClientRect().left - 20;
                const fromY = fromLabelView.globalY - this.root.view.svgDoc.node.getBoundingClientRect().top;
                const toX = e.clientX - this.root.view.svgDoc.node.getBoundingClientRect().left - 20;
                const toY = e.clientY - this.root.view.svgDoc.node.getBoundingClientRect().top;
                let dx = (fromX - toX) / 4;
                let y2 = Math.min(fromY, toY) - 20;
                this.root.view.svgDoc.rect(50, 50).x(toX - 25).y(toY - 25).fill('white').remove();
                this.svgElement = this.root.view.svgDoc.path(`
                M${fromX} ${fromY}
                C${fromX - dx},${y2},${toX + dx},${y2},${toX},${toY}
                `).stroke({color: 'black', width: 1}).fill('none').back();
                this.markerElement = this.svgElement.marker('end', 5, 5, add => {
                    add.polyline('0,0 5,2.5 0,5 0.2,2.5');
                });
            }
        });
        this.root.view.svgDoc.on('contextmenu', (e) => {
            if (this.lastSelection !== null) {
                this.svgElement.remove();
                this.svgElement = null;
                this.lastSelection = null;
                e.preventDefault();
            }
        });
    }
}