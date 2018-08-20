import {EventEmitter} from 'events';
import {Store} from "./Store/Store";
import {View} from "./View/View";
import {Dispatcher} from "./Dispatcher/Dispatcher";

export class Annotator extends EventEmitter {
    store: Store;
    view: View;
    dispatcher: Dispatcher;

    constructor(data: string | object, htmlElement: HTMLElement, public config?: object) {
        super();
        this.store = new Store();
        this.view = new View(htmlElement, this.store);
        this.dispatcher = new Dispatcher(this.store);
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
    }
}