import {EventEmitter} from "events";
import {JSON as StoreJSON, Store} from "./Store/Store";
import {View} from "./View/View";
import {SVGNS} from "./Infrastructure/SVGNS";
import {ConfigInput, parseInput} from "./Config";


export class Annotator extends EventEmitter {
    private readonly store: Store;
    private readonly view: View;

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
        containerElement.appendChild(svgElement);
        this.view = new View(this.store, svgElement, config);
    }
}
