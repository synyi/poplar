import {EventEmitter} from "events";
import {JSON as StoreJSON, Store} from "./Store/Store";
import {View} from "./View/View";
import {SVGNS} from "./Infrastructure/SVGNS";
import {ConfigInput, parseInput} from "./Config";
import {TextSelectionHandler} from "./View/EventHandler/TextSelectionHandler";
import {TwoLabelsClickedHandler} from "./View/EventHandler/TwoLabelsClickedHandler";
import {IAction} from "./Action/IAction";


export class Annotator extends EventEmitter {
    readonly store: Store;
    readonly view: View;
    readonly textSelectionHandler: TextSelectionHandler;
    readonly twoLabelsClickedHandler: TwoLabelsClickedHandler;

    constructor(
        data: string | object,
        private containerElement: HTMLElement,
        public readonly configInput?: ConfigInput
    ) {
        super();
        const config = parseInput(configInput || {});
        this.store = new Store(config);
        this.store.json = typeof data === "string" ? JSON.parse(data) : (data as StoreJSON);
        const svgElement = document.createElementNS(SVGNS, 'svg');
        svgElement.setAttribute("xmlns", SVGNS);
        containerElement.appendChild(svgElement);
        this.view = new View(this, svgElement, config);
        this.textSelectionHandler = new TextSelectionHandler(this, config);
        this.twoLabelsClickedHandler = new TwoLabelsClickedHandler(this, config);
    }

    public applyAction(action: IAction) {
        action.apply(this.store);
    }

    public export(): string {
        this.view.contentEditor.hide();
        // bad for Safari again
        const result = this.view.svgElement.outerHTML.replace(/&nbsp;/, " ");
        this.view.contentEditor.show();
        return result;
    }

    public remove() {
        this.view.svgElement.remove();
        this.view.contentEditor.remove();
    }
}
