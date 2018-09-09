import * as SVG from "svg.js";
import {LineView} from "./LineView";
import {EventEmitter} from "events";
import {fromEvent, Observable, Subscription} from "rxjs";
import {TopContextUser} from "./TopContextUser";
import {LabelView} from "./LabelView";
import {ConnectionView} from "./ConnectionView";
import {assert} from "../../Infrastructure/Assert";
import {filter} from "rxjs/operators";

export class TopContext {
    svgElement: SVG.G;

    elements: Set<TopContextUser>;

    positionChanged$: Observable<void>;

    labelCreatedSubscription: Subscription = null;
    labelDeletedSubscription: Subscription = null;
    connectionCreatedSubscription: Subscription = null;
    connectionDeletedSubscription: Subscription = null;

    rerendered$: Observable<void>;

    private eventEmitter = new EventEmitter();

    constructor(public readonly attachTo: LineView.Entity) {
        this.elements = new Set<TopContextUser>();
        this.positionChanged$ = fromEvent(this.eventEmitter, 'positionChanged');
        for (let label of this.attachTo.store.labelsInThisLine) {
            let newLabelView = new LabelView.Entity(label.id, label, this);
            this.attachTo.root.labelViewRepo.add(newLabelView);
            this.elements.add(newLabelView);
            for (let connection of label.sameLineConnections) {
                let newConnectionView = new ConnectionView.Entity(connection.id, connection, this);
                this.attachTo.root.connectionViewRepo.add(newConnectionView);
                this.elements.add(newConnectionView);
            }
        }
        this.labelCreatedSubscription = this.attachTo.root.store.labelRepo.created$.pipe(
            filter(it => this.attachTo.store.isLabelInThisLine(it))
        ).subscribe(it => {
            let theLabel = this.attachTo.root.store.labelRepo.get(it);
            let theLabelView = new LabelView.Entity(theLabel.id, theLabel, this);
            if (!this.attachTo.root.labelViewRepo.has(theLabelView.id)) {
                this.attachTo.root.labelViewRepo.add(theLabelView);
            }
            this.addElement(theLabelView);
        });
        this.connectionCreatedSubscription = this.attachTo.root.store.connectionRepo.created$.pipe(
            filter(it => this.attachTo.store.isConnectionInThisLine(it))
        ).subscribe(it => {
            let theConnection = this.attachTo.root.store.connectionRepo.get(it);
            let theConnectionView = new ConnectionView.Entity(theConnection.id, theConnection, this);
            if (!this.attachTo.root.connectionViewRepo.has(theConnectionView.id)) {
                this.attachTo.root.connectionViewRepo.add(theConnectionView);
            }
            this.addElement(theConnectionView);
        });
        this.labelDeletedSubscription = this.attachTo.root.store.labelRepo.deleted$.pipe(
            filter(it => this.attachTo.store.isLabelInThisLine(it))
        ).subscribe(it => {
            this.attachTo.root.labelViewRepo.delete(it.id);
            let originHeight = this.height;
            for (let ele of this.elements) {
                if (ele instanceof LabelView.Entity && ele.id === it.id) {
                    this.elements.delete(ele);
                    break;
                }
            }
            if (this.height !== originHeight) {
                this.attachTo.layout();
                this.layout(this.height - originHeight);
                this.attachTo.layoutAfterSelf(this.height - originHeight);
            }
        });
        this.connectionDeletedSubscription = this.attachTo.root.store.connectionRepo.deleted$.pipe(
            filter(it => this.attachTo.store.isConnectionInThisLine(it))
        ).subscribe(it => {
            this.attachTo.root.connectionViewRepo.delete(it.id);
            let originHeight = this.height;
            for (let ele of this.elements) {
                if (ele instanceof ConnectionView.Entity && ele.id === it.id) {
                    this.elements.delete(ele);
                    break;
                }
            }
            if (this.height !== originHeight) {
                this.attachTo.layout();
                this.layout(this.height - originHeight);
                this.attachTo.layoutAfterSelf(this.height - originHeight);
            }
        });
    }

    _y: number = null;

    get y() {
        assert(this._y !== null);
        return this._y;
    }

    set y(value: number) {
        if (value !== this._y) {
            this._y = value;
            this.svgElement.y(this.y);
            this.positionChanged();
        }
    }

    get height() {
        for (let element of this.elements) {
            if (element instanceof LabelView.Entity)
                element.eliminateOverlapping();
        }
        for (let element of this.elements) {
            if (element instanceof ConnectionView.Entity)
                element.eliminateOverlapping();
        }
        let maxLayer = 0;
        for (let it of this.elements) {
            if (it.layer > maxLayer) {
                maxLayer = it.layer;
            }
        }
        return maxLayer * 30;
    }

    layout(dy: number) {
        if (dy === null) {
            if (this.attachTo.isFirst) {
                this.y = (this.attachTo.svgElement.node as any as SVGTSpanElement).getExtentOfChar(0).y;
            } else {
                this.y = this.attachTo.prev.topContext.y + 20.8 + this.height;
            }
        } else {
            this.y += dy;
        }
    }

    render() {
        this.elements.forEach(it => it.render());
    }

    preRender(context: SVG.Doc) {
        this.svgElement = context.group().back();
        this.elements.forEach(it => it.preRender());
    }

    initPosition() {
        this.elements.forEach(it => it.initPosition());
    }

    postRender(): any {
        this.elements.forEach(it => it.postRender());
    }

    remove() {
        for (let element of this.elements) {
            if (element instanceof LabelView.Entity) {
                this.attachTo.root.labelViewRepo.delete(element);
            } else if (element instanceof ConnectionView.Entity) {
                this.attachTo.root.connectionViewRepo.delete(element);
            }
        }
        this.svgElement.remove();
        this.labelCreatedSubscription.unsubscribe();
        this.labelDeletedSubscription.unsubscribe();
        this.connectionCreatedSubscription.unsubscribe();
        this.connectionDeletedSubscription.unsubscribe();
    }

    addElement(element: TopContextUser) {
        const originHeight = this.height;
        this.elements.add(element);
        element.preRender();
        element.initPosition();
        element.eliminateOverlapping();
        element.render();
        element.postRender();
        if (originHeight !== this.height) {
            this.attachTo.layout();
            this.layout(this.height - originHeight);
            this.attachTo.layoutAfterSelf(this.height - originHeight);
        }
    }

    private positionChanged() {
        this.eventEmitter.emit('positionChanged');
    }
}
