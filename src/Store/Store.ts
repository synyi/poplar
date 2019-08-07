import {RepositoryRoot} from "../Infrastructure/Repository";
import {LabelCategory} from "./Entities/LabelCategory";
import {Label} from "./Entities/Label";
import {ConnectionCategory} from "./Entities/ConnectionCategory";
import {Connection} from "./Entities/Connection";

export interface Config {
    readonly allowMultipleLabel: "notAllowed" | "differentCategory" | "allowed";
    readonly allowMultipleConnection: "notAllowed" | "differentCategory" | "allowed";
    readonly defaultLabelColor: string;
}

export interface JSON {
    readonly content: string;

    readonly labelCategories: Array<LabelCategory.JSON>;
    readonly labels: Array<Label.JSON>;

    readonly connectionCategories: Array<ConnectionCategory.Entity>;
    readonly connections: Array<Connection.JSON>;
}

export class Store implements RepositoryRoot {
    readonly labelCategoryRepo: LabelCategory.Repository;
    readonly labelRepo: Label.Repository;
    readonly connectionCategoryRepo: ConnectionCategory.Repository;
    readonly connectionRepo: Connection.Repository;
    readonly config: Config;

    constructor(config: Config) {
        this.labelCategoryRepo = new LabelCategory.Repository(this);
        this.labelRepo = new Label.Repository(this, config);
        this.connectionCategoryRepo = new ConnectionCategory.Repository(this);
        this.connectionRepo = new Connection.Repository(this, config);
        this.config = config;
    }

    private _content: string;

    get content(): string {
        return this._content;
    }

    set content(text: string) {
        this.json = {
            content: text,
            labelCategories: [],
            labels: [],
            connectionCategories: [],
            connections: []
        }
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

    set json(json: JSON) {
        this._content = json.content.endsWith('\n') ? json.content : (json.content + '\n');
        LabelCategory.constructAll(json.labelCategories, this.config).map(it => this.labelCategoryRepo.add(it));
        Label.constructAll(json.labels, this).map(it => this.labelRepo.add(it));
        json.connectionCategories.map(it => this.connectionCategoryRepo.add(it));
        Connection.constructAll(json.connections, this).map(it => this.connectionRepo.add(it));
    }

    contentSlice(startIndex: number, endIndex: number): string {
        return this.content.slice(startIndex, endIndex);
    }
}
