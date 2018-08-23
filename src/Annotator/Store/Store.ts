import {LabelCategory} from "./Entities/LabelCategory";
import {Label} from "./Entities/Label";
import {RepositoryRoot} from "../Infrastructure/Repository";
import {ConnectionCategory} from "./Entities/ConnectionCategory";
import {Connection} from "./Entities/Connection";
import {Line} from "./Entities/Line";
import {fromEvent, Observable} from "rxjs";
import {EventEmitter} from 'events';

export class Store implements RepositoryRoot {
    content: string;
    lineRepo: Line.Repository;
    labelCategoryRepo: LabelCategory.Repository;
    labelRepo: Label.Repository;
    connectionCategoryRepo: ConnectionCategory.Repository;
    connectionRepo: Connection.Repository;
    config: { maxLineWidth: number };
    readonly ready$: Observable<void>;
    private readonly eventEmitter = new EventEmitter();

    constructor() {
        this.lineRepo = new Line.Repository(this);
        this.labelCategoryRepo = new LabelCategory.Repository(this);
        this.labelRepo = new Label.Repository(this);
        this.connectionCategoryRepo = new ConnectionCategory.Repository(this);
        this.connectionRepo = new Connection.Repository(this);
        this.config = {maxLineWidth: 80};
        this.ready$ = fromEvent(this.eventEmitter, 'ready');
        this.labelRepo.readyToCreate$.subscribe(it => {
            this.mergeForLabel(it);
        });
    }

    set text(text: string) {
        this.json = {
            content: text,
            labelCategories: [],
            labels: [],
            connectionCategories: [],
            connections: []
        }
    }

    get json(): any {
        let obj: any = {};
        obj.content = this.content;
        obj.labelCategories = this.labelCategoryRepo.json;
        obj.labels = this.labelRepo.json;
        obj.connectionCategories = this.connectionCategoryRepo.json;
        obj.connections = this.connectionRepo.json;
        return obj;
    }

    set json(json: any) {
        let obj: any;
        if (typeof json === "string") {
            obj = JSON.parse(json);
        } else {
            obj = json;
        }
        this.content = obj.content.slice(0, 1000);
        Line.construct(this).map(it => this.lineRepo.add(it));
        LabelCategory.constructAll(obj.labelCategories).map(it => this.labelCategoryRepo.add(it));
        Label.constructAll(obj.labels, this).map(it => this.labelRepo.add(it));
        ConnectionCategory.constructAll(obj.connectionCategories).map(it => this.connectionCategoryRepo.add(it));
        Connection.constructAll(obj.connections, this).map(it => this.connectionRepo.add(it));
        this.eventEmitter.emit('ready');
    }

    private mergeForLabel(theLabel: Label.Entity) {
        let startInLineId = -1;
        let endInLineId = -1;
        for (let [id, line] of this.lineRepo) {
            if (line.startIndex <= theLabel.startIndex && theLabel.startIndex < line.endIndex) {
                startInLineId = id;
            }
            if (line.startIndex < theLabel.endIndex && theLabel.endIndex <= line.endIndex) {
                endInLineId = id;
            }
        }
        if (startInLineId !== endInLineId) {
            this.mergeLines(startInLineId, endInLineId);
        }
    }

    private mergeLines(startInLineId: number, endInLineId: number) {
        const startLine = this.lineRepo.get(startInLineId);
        const endLine = this.lineRepo.get(endInLineId);
        for (let i = startInLineId + 1; i <= endInLineId; ++i) {
            this.lineRepo.delete(i);
        }
        this.lineRepo.set(startInLineId, new Line.Entity(startInLineId, startLine.allContent, startLine.startIndex, endLine.endIndex, this))
    }
}