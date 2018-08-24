import {EventEmitter} from 'events';
import {Store} from "./Store/Store";
import {View} from "./View/View";
import {Dispatcher} from "./Dispatcher/Dispatcher";
import {Action} from "./Action/Action";
import {TextSelectionHandler} from "./View/TextSelectionHandler";
import {TwoLabelsClickedHandler} from "./View/TwoLabelsClickedHandler";

EventEmitter.defaultMaxListeners = 10000;

export class Annotator extends EventEmitter {
    store: Store;
    view: View;
    dispatcher: Dispatcher;
    textSelectionHandler: TextSelectionHandler;
    twoLabelsClickedHandler: TwoLabelsClickedHandler;

    constructor(data: string | object, private htmlElement: HTMLElement, public config?: object) {
        super();
        this.store = new Store();
        this.view = new View(htmlElement, this);
        this.dispatcher = new Dispatcher(this.store);
        this.textSelectionHandler = new TextSelectionHandler(this);
        this.twoLabelsClickedHandler = new TwoLabelsClickedHandler(this);
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

    applyAction(action: Action.IAction) {
        this.dispatcher.dispatch(action);
    }

    remove() {
        this.htmlElement.innerHTML = '';
    }
}