import {DataSource} from "./Store/DataSource";
import {Store} from "./Store/Store";
import {RenderMode, View} from "./View/View";

export class Annotator {
    view: View;
    store: Store;

    constructor(
        dataSource: DataSource,
        private svgElement: HTMLElement,
        renderMode: RenderMode
    ) {
        this.store = new Store(dataSource);
        this.view = new View(this.store, svgElement, renderMode);
    }
}
