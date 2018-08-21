import * as SVG from "svg.js";
import {RepositoryRoot} from "../Infrastructure/Repository";
import {LineView} from "./Entities/LineView";
import {Label} from "../Store/Entities/Label";
import {LabelView} from "./Entities/LabelView";
import {Annotator} from "../Annotator";

export class View implements RepositoryRoot {
    readonly svgDoc: SVG.Doc;
    readonly lineViewRepo: LineView.Repository;
    readonly labelViewRepo: LabelView.Repository;

    constructor(htmlElement: HTMLElement, public readonly root: Annotator) {
        this.svgDoc = SVG(htmlElement);
        this.svgDoc.width(1024).height(768);
        (this.svgDoc as any).view = this;
        this.lineViewRepo = new LineView.Repository(this);
        this.labelViewRepo = new LabelView.Repository(this);
        this.render();
        this.store.ready$.subscribe(() => {
            this.construct();
            this.render();
        });
        this.store.labelRepo.deleted$.subscribe(it => {
            this.labelViewRepo.delete(it.id)
        });
        this.store.lineRepo.deleted$.subscribe(it => this.lineViewRepo.delete(it.id));
    }

    get store() {
        return this.root.store;
    }

    private construct() {
        LineView.constructAll(this).map(it => this.lineViewRepo.add(it));
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
        let svgText = this.svgDoc.text('');
        svgText.clear();
        svgText.build(true);
        for (let [_, entity] of this.lineViewRepo) {
            entity.render(svgText);
        }
    }
}