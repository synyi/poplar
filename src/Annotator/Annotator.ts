import {DataSource} from "./Store/DataSource";
import {Store} from "./Store/Store";
import {View} from "./View/View";
import {RenderBehaviour} from "./View/Element/Root/RenderBehaviour/RenderBehaviour";

export class Annotator {
    view: View;
    store: Store;

    constructor(
        dataSource: DataSource,
        private svgElement: HTMLElement,
        renderBehaviour: RenderBehaviour
    ) {
        this.store = new Store(dataSource);
        this.view = new View(this.store, svgElement, renderBehaviour);
    }
}
