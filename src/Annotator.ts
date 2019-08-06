import {EventEmitter} from "events";
import {Store, StoreJson} from "./Store/Store";
import {View, ViewConfig} from "./View/View";
import {svgNS} from "./Infrastructure/svgNS";
import {fromTry} from "./Infrastructure/option";

export interface AnnotatorConfig extends ViewConfig {
}

export class Annotator extends EventEmitter {
    private store: Store;
    private view: View;

    constructor(
        data: string | object,
        private htmlElement: HTMLElement,
        public config?: AnnotatorConfig) {
        super();
        this.store = new Store();
        this.store.json = data as StoreJson;
        const svgElement = document.createElementNS(svgNS, 'svg');
        htmlElement.appendChild(svgElement);
        this.view = new View(this.store, svgElement, {
            contentClasses: fromTry(() => config.contentClasses).toNullable(),
            labelClasses: fromTry(() => config.labelClasses).toNullable(),
            connectionClasses: fromTry(() => config.connectionClasses).toNullable()
        });
    }
}
