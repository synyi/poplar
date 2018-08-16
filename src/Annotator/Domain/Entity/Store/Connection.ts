import {Base} from "../../../../Common/Base/Repository";
import {assert} from "../../../../Infrastructure/Assert";

export namespace Connection {
    class Entity {
        constructor(
            public readonly categoryIndex: number,
            public readonly fromLabelIndex: number,
            public readonly toLabelIndex: number) {
        }
    }

    export let repository = new Base.Repository<Entity>();

    export function construct(json: Array<any>): Array<number> {
        let result = [];
        for (let connection of json) {
            result.push(connection.id);
            assert(Connection.repository.has(connection.categoryId));
            this.labels.set(connection.id, new Entity(connection.categoryId, connection.fromId, connection.toId));
        }
        return result;
    }
}