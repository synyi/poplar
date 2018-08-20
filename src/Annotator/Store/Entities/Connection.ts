import {Base} from "../../Infrastructure/Repository";
import {Store} from "../Store";

export namespace Connection {
    export class Entity {
        constructor(
            public readonly id: number,
            public readonly categoryId: number,
            public readonly fromId: number,
            public readonly toId: number
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
        return new Entity(parseInt(json.id), parseInt(json.categoryId), parseInt(json.fromId), parseInt(json.toId));
    }

    export function constructAll(json: Array<object>): Array<Entity> {
        return json.map(construct);
    }
}