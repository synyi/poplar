import {Base} from "../Infrastructure/Repository";
import {Store} from "./Store";

export namespace Label {
    export class Entity {
        constructor(
            public readonly id: number,
            public readonly categoryId: number,
            public readonly startIndex: number,
            public readonly endIndex: number
        ) {
        }
    }

    export class Repository extends Base.Repository<Entity> {
        root: Store;

        constructor(root: Store) {
            super(root);
        }
    }

    export function construct(json: any): Entity {
        return new Entity(parseInt(json.id), parseInt(json.categoryId), parseInt(json.startIndex), parseInt(json.endIndex));
    }

    export function constructAll(json: Array<any>): Array<Entity> {
        return json.map(construct);
    }
}