import {LabelCategory} from "./LabelCategory";
import {Label} from "./Label";
import {ConnectionCategory} from "./ConnectionCategory";
import {Connection} from "./Connection";
import {EventEmitter} from "events";

export interface Config extends LabelCategory.Config, Label.Config, Connection.Config {
    readonly contentEditable: boolean;
}

export interface JSON {
    readonly content: string;

    readonly labelCategories: Array<LabelCategory.JSON>;
    readonly labels: Array<Label.JSON>;

    readonly connectionCategories: Array<ConnectionCategory.Entity>;
    readonly connections: Array<Connection.JSON>;
}

export class Store extends EventEmitter {
    readonly labelCategoryRepo: LabelCategory.Repository;
    readonly labelRepo: Label.Repository;
    readonly connectionCategoryRepo: ConnectionCategory.Repository;
    readonly connectionRepo: Connection.Repository;
    readonly config: Config;
    private _content: string;

    constructor(config: Config) {
        super();
        this.config = config;
        this.labelCategoryRepo = new LabelCategory.Repository();
        this.labelRepo = new Label.Repository(config);
        this.connectionCategoryRepo = new ConnectionCategory.Repository();
        this.connectionRepo = new Connection.Repository(config);
    }

    get content() {
        return this._content;
    }

    set json(json: JSON) {
        this._content = json.content.endsWith('\n') ? json.content : (json.content + '\n');
        LabelCategory.Factory.createAll(json.labelCategories, this.config).map(it => this.labelCategoryRepo.add(it));
        Label.Factory.createAll(json.labels, this).map(it => this.labelRepo.add(it));
        json.connectionCategories.map(it => this.connectionCategoryRepo.add(it));
        Connection.Factory.createAll(json.connections, this).map(it => this.connectionRepo.add(it));
    }

    contentSlice(startIndex: number, endIndex: number): string {
        return this.content.slice(startIndex, endIndex);
    }

    private moveLabels(startFromIndex: number, distance: number) {
        Array.from(this.labelRepo.values())
            .filter(it => it.startIndex >= startFromIndex)
            .map(it => it.move(distance));
    }

    get json(): JSON {
        return {
            content: this._content,
            labelCategories: this.labelCategoryRepo.json as Array<LabelCategory.JSON>,
            labels: this.labelRepo.json as Array<Label.JSON>,
            connectionCategories: this.connectionCategoryRepo.json as Array<ConnectionCategory.Entity>,
            connections: this.connectionRepo.json as Array<Connection.JSON>
        }
    }

    spliceContent(start: number, removeLength: number, ...inserts: Array<string> | undefined) {
        const removeEnd = start + removeLength;
        if (removeLength === 0 || Array.from(this.labelRepo.values())
            .find((label: Label.Entity) =>
                (label.startIndex <= start && start < label.endIndex) ||
                (label.startIndex < removeEnd && removeEnd < label.endIndex)
            ) === undefined) {
            const notTouchedFirstPart = this.content.slice(0, start);
            const removed = this.content.slice(start, start + removeLength);
            const inserted = (inserts || []).join('');
            const notTouchedSecondPart = this.content.slice(start + removeLength);
            this._content = notTouchedFirstPart + inserted + notTouchedSecondPart;
            this.moveLabels(start + removeLength, inserted.length - removed.length);
            this.emit('contentSpliced', start, removed, inserted);
        }
    }
}
