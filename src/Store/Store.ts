import {RepositoryRoot} from "../Infrastructure/Repository";
import {LabelCategory} from "./Entities/LabelCategory";
import {Label} from "./Entities/Label";
import {ConnectionCategory} from "./Entities/ConnectionCategory";
import {Connection} from "./Entities/Connection";

export interface StoreJson {
    readonly content: string;
    readonly labelCategories: Array<any>;
    readonly labels: Array<any>;
    readonly connectionCategories: Array<any>;
    readonly connections: Array<any>;
}

export class Store implements RepositoryRoot {
    readonly labelCategoryRepo: LabelCategory.Repository;
    readonly labelRepo: Label.Repository;
    readonly connectionCategoryRepo: ConnectionCategory.Repository;
    readonly connectionRepo: Connection.Repository;
    readonly config: { allowMultipleLabel: boolean };

    constructor() {
        this.labelCategoryRepo = new LabelCategory.Repository(this);
        this.labelRepo = new Label.Repository(this);
        this.connectionCategoryRepo = new ConnectionCategory.Repository(this);
        this.connectionRepo = new Connection.Repository(this);
        this.config = {allowMultipleLabel: true};
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

    get json(): StoreJson {
        return {
            content: this._content,
            labelCategories: this.labelCategoryRepo.json,
            labels: this.labelRepo.json,
            connectionCategories: this.connectionCategoryRepo.json,
            connections: this.connectionRepo.json
        }
    }

    set json(json: StoreJson) {
        this._content = json.content.endsWith('\n') ? json.content : (json.content + '\n');
        LabelCategory.constructAll(json.labelCategories).map(it => this.labelCategoryRepo.add(it));
        Label.constructAll(json.labels, this).map(it => this.labelRepo.add(it));
        ConnectionCategory.constructAll(json.connectionCategories).map(it => this.connectionCategoryRepo.add(it));
        Connection.constructAll(json.connections, this).map(it => this.connectionRepo.add(it));
    }

    contentSlice(startIndex: number, endIndex: number): string {
        return this.content.slice(startIndex, endIndex);
    }
}
