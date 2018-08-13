import {EventEmitter} from "events";
import {Store} from "./Store/Store";
import {View} from "./View/View";
import {DataManager} from "./DataManager/DataManager";
import {RenderBehaviourFactory} from "./View/Element/Root/RenderBehaviour/RenderBehaviourFactory";
import {SoftLine} from "./View/Element/SoftLine";

EventEmitter.defaultMaxListeners = 10000;

export enum RenderBehaviourOptions {
    ONE_SHOT = 0,
    LAZY = 1
}

export class AnnotatorConfig {
    constructor(public renderBehavoiur: RenderBehaviourOptions,
                public suggestLineWidth: number) {
    }
}

class DefaultAnnotatorConfig extends AnnotatorConfig {
    constructor() {
        super(RenderBehaviourOptions.ONE_SHOT, 80);
    }
}

export class Annotator extends EventEmitter {
    static instance: Annotator = null;
    private store: Store = null;
    private view: View = null;

    constructor(dataSource: DataManager,
                htmlElement: HTMLElement,
                config: AnnotatorConfig = new DefaultAnnotatorConfig()) {
        super();
        Annotator.instance = this;
        this.store = new Store(dataSource);
        SoftLine.maxWidth = config.suggestLineWidth;
        this.view = new View(this.store, htmlElement, RenderBehaviourFactory.construct(config.renderBehavoiur));
    }
}