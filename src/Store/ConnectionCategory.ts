import {Base} from "../Infrastructure/Repository";

export namespace ConnectionCategory {
    export interface Entity {
        readonly id: number;
        readonly text: string;
    }

    export class Repository extends Base.Repository<Entity> {
    }
}
