import {Base} from "../../../../Common/Base/Repository";
import {LabelCategory} from "../LabelCategory/LabelCategory";
import {assert} from "../../../../Infrastructure/Assert";

export namespace Label {
    export class Entity {
        constructor(
            public readonly categoryIndex: number,
            public readonly startIndex: number,
            public readonly endIndex: number) {
        }

        get category(): LabelCategory.Entity {
            return LabelCategory.repository.get(this.categoryIndex)
        }
    }

    export let repository = new Base.Repository<Entity>();

    export function construct(json: Array<any>): Array<number> {
        let result = [];
        for (let label of json) {
            result.push(label.id);
            assert(LabelCategory.repository.has(label.categoryId));
            this.labels.set(label.id, new Entity(label.categoryId, label.startIndex, label.endIndex));
        }
        return result;
    }
}