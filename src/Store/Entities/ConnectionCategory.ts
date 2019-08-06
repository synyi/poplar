import {Base} from "../../Infrastructure/Repository";
import {Store} from "../Store";

export namespace ConnectionCategory {
    interface EntityJson {
        readonly id: string;
        readonly text: string;
    }

    export interface Entity {
        readonly id: number;
        readonly text: string;
    }

    export class Repository extends Base.Repository<Entity> {
        readonly root: Store;

        constructor(root: Store) {
            super(root);
        }
    }

    export function construct(json: EntityJson): Entity {
        return {
            id: parseInt(json.id),
            text: json.text
        };
    }

    export function constructAll(json: Array<EntityJson>): Array<Entity> {
        return json.map(construct);
    }
}
