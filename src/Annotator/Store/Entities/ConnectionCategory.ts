import {Base} from "../../Infrastructure/Repository";
import {Store} from "../Store";

export namespace ConnectionCategory {
    export class Entity {
        constructor(
            public readonly id: number,
            public readonly text: string
        ) {
        }
    }

    export class Repository extends Base.Repository<Entity> {
        readonly root: Store;

        constructor(root: Store) {
            super(root);
        }
    }

    export function construct(json: any): Entity {
        return new Entity(parseInt(json.id), json.text);
    }

    export function constructAll(json: Array<object>): Array<Entity> {
        return json.map(construct);
    }
}