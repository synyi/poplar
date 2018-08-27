import * as SVG from "svg.js";
import {RepositoryRoot} from "../Infrastructure/Repository";
import {LineView} from "./Entities/LineView";
import {Label} from "../Store/Entities/Label";
import {LabelView} from "./Entities/LabelView";
import {Annotator} from "../Annotator";
import {ConnectionView} from "./Entities/ConnectionView";

export class View implements RepositoryRoot {
    readonly svgDoc: SVG.Doc;
    readonly lineViewRepo: LineView.Repository;
    readonly labelViewRepo: LabelView.Repository;
    readonly connectionViewRepo: ConnectionView.Repository;

    constructor(htmlElement: HTMLElement, public readonly root: Annotator) {
        this.svgDoc = SVG(htmlElement);
        this.svgDoc.width(1024).height(768);
        (this.svgDoc as any).view = this;
        this.svgDoc.style({'padding-left': '20px', 'padding-right': '20px'});
        this.lineViewRepo = new LineView.Repository(this);
        this.labelViewRepo = new LabelView.Repository(this);
        this.connectionViewRepo = new ConnectionView.Repository(this);
        this.store.ready$.subscribe(() => {
            this.construct();
            this.render();
            this.root.store.connectionRepo.created$
                .subscribe(it => {
                    this.connectionViewRepo.add(new ConnectionView.Entity(it, this.store.connectionRepo.get(it), this));
                });
            this.resize();
        });
        this.store.labelRepo.deleted$.subscribe(it => {
            this.labelViewRepo.delete(it.id);
        });
        this.store.lineRepo.deleted$.subscribe(it => {
            this.lineViewRepo.delete(it.id);
        });
        this.store.connectionRepo.deleted$.subscribe(it => {
            this.connectionViewRepo.delete(it.id);
        });
    }

    get store() {
        return this.root.store;
    }

    private construct() {
        LineView.constructAll(this).map(it => this.lineViewRepo.add(it));
        ConnectionView.constructAll(this).map(it => this.connectionViewRepo.add(it));
        for (let [_, entity] of this.lineViewRepo) {
            const labels = this.store.labelRepo.getEntitiesInRange(entity.store.startIndex, entity.store.endIndex);
            labels.map((label: Label.Entity) => {
                let newLabelView = new LabelView.Entity(label.id, label, entity.topContext);
                this.labelViewRepo.add(newLabelView);
                entity.topContext.elements.add(newLabelView);
            });
        }
    }

    render() {
        const head = document.getElementsByTagName('head')[0];
        const style = document.createElement('style');
        style.type = 'text/css';
        style.appendChild(document.createTextNode('svg .label-view:hover rect {transition: all 0.15s;stroke: red;stroke-width:2;}'));
        style.appendChild(document.createTextNode('svg .connection-view:hover text {transition: all 0.15s;fill:#006699;cursor:pointer;text-decoration:underline;color:blue;}'));
        head.appendChild(style);
        let svgText = this.svgDoc.text('');
        svgText.clear();
        svgText.build(true);
        for (let [_, entity] of this.lineViewRepo) {
            entity.render(svgText);
        }
    }

    resize() {
        this.svgDoc.size(this.svgDoc.bbox().width + 50, this.svgDoc.bbox().height + 50);
    }
}