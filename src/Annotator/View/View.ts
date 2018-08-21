import {Store} from "../Store/Store";
import * as SVG from "svg.js";
import {RepositoryRoot} from "../Infrastructure/Repository";
import {LineView} from "./Entities/LineView";
import {Label} from "../Store/Entities/Label";
import {LabelView} from "./Entities/LabelView";

export class View implements RepositoryRoot {
    readonly svgDoc: SVG.Doc;
    readonly lineViewRepo: LineView.Repository;

    constructor(htmlElement: HTMLElement, public readonly store: Store) {
        this.svgDoc = SVG(htmlElement);
        this.svgDoc.width(1024).height(768);
        (this.svgDoc as any).view = this;
        this.lineViewRepo = new LineView.Repository(this);
        this.render();
        this.store.ready$.subscribe(() => {
            this.construct();
            this.render();
        });
        this.store.lineRepo.deleted$.subscribe(it => this.lineViewRepo.delete(it.id));
    }

    private construct() {
        LineView.constructAll(this).map(it => this.lineViewRepo.add(it));
        for (let [_, entity] of this.lineViewRepo) {
            const labels = this.store.labelRepo.getEntitiesInRange(entity.store.startIndex, entity.store.endIndex);
            labels.map((label: Label.Entity) => {
                entity.topContext.elements.add(new LabelView.Entity(label.id, this, entity.topContext));
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