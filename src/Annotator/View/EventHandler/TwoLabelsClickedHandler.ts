import {Annotator} from "../../Annotator";

export class TwoLabelsClickedHandler {
    lastSelection = null;

    constructor(public root: Annotator) {
        this.root.on('labelClicked', (id: number) => {
            if (this.lastSelection === null) {
                this.lastSelection = id;
            } else {
                this.root.emit('twoLabelsClicked', this.lastSelection, id);
                this.lastSelection = null;
            }
        });
    }
}