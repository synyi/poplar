import {DataSource} from "./Store/DataSource";
import {Store} from "./Store/Store";
import {View} from "./View/View";

export class Annotator {
    private view: View;
    private store: Store;

    constructor(
        dataSource: DataSource,
        private svgElement: HTMLElement
    ) {
        this.store = new Store(dataSource);
        this.view = new View(this.store, svgElement, 1500, 5000);
    }
}
