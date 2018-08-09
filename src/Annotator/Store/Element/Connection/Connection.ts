import {Destructable} from "../../../Common/Base/Destructable";
import {Label} from "../Label/Label";
import {ConnectionCategory} from "./ConnectionCategory";

export class Connection extends Destructable {
    static all: Set<Connection> = new Set<Connection>();

    constructor(public category: ConnectionCategory,
                public fromLabel: Label,
                public toLabel: Label) {
        super();
        Connection.all.add(this);
    }

    get text() {
        return this.category.text;
    }

    _destructor() {
        Connection.all.delete(this);
    }
}