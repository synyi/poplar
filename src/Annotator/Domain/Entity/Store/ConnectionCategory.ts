import {Base} from "../../../../Common/Base/Repository";

export namespace ConnectionCategory {
    export class Entity {
        constructor(public readonly text: string) {
        }
    }

    export let repository = new Base.Repository<Entity>();

    export function construct(json: Array<any>): Array<number> {
        let result = [];
        for (let category of json) {
            result.push(category.id);
            repository.set(category.id, new Entity(category.text));
        }
        return result;
    }
}