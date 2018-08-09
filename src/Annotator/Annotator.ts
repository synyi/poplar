import {EventEmitter} from "events";
import {Store} from "./Store/Store";
import {View} from "./View/View";
import {DataSource} from "./DataSource/DataSource";
import {RenderBehaviourFactory} from "./View/Element/Root/RenderBehaviour/RenderBehaviourFactory";

EventEmitter.defaultMaxListeners = 10000;

export enum RenderBehaviourOptions {
    ONE_SHOT,
    LAZY
}

export class AnnotatorConfig {
    public renderBehavoiur: RenderBehaviourOptions;
}

class DefaultAnnotatorConfig extends AnnotatorConfig {
    constructor() {
        super();
        this.renderBehavoiur = RenderBehaviourOptions.ONE_SHOT;
    }
}

export class Annotator {
    private store: Store = null;
    private view: View = null;

    constructor(dataSource: DataSource,
                htmlElement: HTMLElement,
                config: AnnotatorConfig = new DefaultAnnotatorConfig()) {
        this.store = new Store(dataSource);
        this.view = new View(this.store, htmlElement, RenderBehaviourFactory.construct(config.renderBehavoiur));
    }
}