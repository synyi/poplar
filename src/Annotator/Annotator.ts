import {EventEmitter} from 'events';
import {Store} from "./Domain/Store";

export class Annotator extends EventEmitter {
    store: Store;

    constructor(data: string | object, htmlElement: HTMLElement, public config: object) {
        super();
        this.store = new Store();
        if (typeof data === "string") {
            try {
                JSON.parse(data);
                this.store.json = data;
            } catch (e) {
                // cannot parse
                // is not json
                this.store.text = data;
            }
        } else {
            this.store.json = data;
        }
        this.view = new View(htmlElement);
        this.view.render();
    }
}