import {Base} from "../../Infrastructure/Repository";
import {Store} from "../Store";

export namespace ConnectionCategory {
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
}
