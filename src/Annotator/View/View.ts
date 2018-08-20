import {Store} from "../Store/Store";
import * as SVG from "svg.js";
import {RepositoryRoot} from "../Infrastructure/Repository";
import {LineView} from "./Entities/LineView";
import {Label} from "../Store/Entities/Label";
import {LabelView} from "./Entities/LabelView";

export class View implements RepositoryRoot {
    readonly svgDoc: SVG.Doc;
    readonly lineViewRepo: LineView.Repository;

    constructor(
        htmlElement: HTMLElement,
        public readonly store: Store) {
        this.svgDoc = SVG(htmlElement);
        this.svgDoc.width(1024).height(768);
        (this.svgDoc as any).view = this;
        this.lineViewRepo = new LineView.Repository(this);
        this.store.ready$.subscribe(() => {
            LineView.constructAll(this.store.lineRepo).map(it => this.lineViewRepo.add(it));
            for (let [_, entity] of this.lineViewRepo) {
                const labels = this.store.labelRepo.getEntitiesInRange(entity.store.startIndex, entity.store.endIndex);
                labels.map((label: Label.Entity) => {
                    entity.topContext.elements.add(new LabelView.Entity(label.id, this, entity.topContext));
                });
            }
            this.render();
        });
        this.store.lineRepo.updated$.subscribe(id => {
            this.lineViewRepo.get(id).topContext.elements.clear();
            this.lineViewRepo.get(id).store = this.store.lineRepo.get(id);
            const labels = this.store.labelRepo.getEntitiesInRange(this.lineViewRepo.get(id).store.startIndex, this.lineViewRepo.get(id).store.endIndex);
            labels.map((label: Label.Entity) => {
                this.lineViewRepo.get(id).topContext.elements.add(new LabelView.Entity(label.id, this, this.lineViewRepo.get(id).topContext));
            });
            this.lineViewRepo.get(id).rerender();
            for (let i = id + 1; i < this.lineViewRepo.length; ++i) {
                if (this.lineViewRepo.has(i))
                    this.lineViewRepo.get(i).layout(null);
            }
        });
        this.store.lineRepo.deleted$.subscribe(it => this.lineViewRepo.delete(it.id));
        this.store.labelRepo.created$.subscribe(it => {
            let label = this.store.labelRepo.get(it);
            let id: number;
            for (let [i, entity] of this.lineViewRepo) {
                if (entity.store.startIndex <= label.startIndex && label.endIndex <= entity.store.endIndex) {
                    entity.addElement(new LabelView.Entity(it, this, entity.topContext));
                    id = i;
                    break;
                }
            }
            for (let i = id + 1; i < this.store.lineRepo.length; ++i) {
                if (this.lineViewRepo.has(i))
                    this.lineViewRepo.get(i).layout(null);
            }
        });
        this.lineViewRepo.deleted$.subscribe(it => {
            for (let id = it.id + 1; id < this.lineViewRepo.length; ++id) {
                if (this.lineViewRepo.has(id))
                    this.lineViewRepo.get(id).layout(it.topContext.height);
            }
        });
        this.render();
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