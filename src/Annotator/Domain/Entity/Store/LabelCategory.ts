import {Base} from "../../../../Common/Base/Repository";
import {shadeColor} from "../../../../Infrastructure/ShadeColor";

export namespace LabelCategory {
    export class Entity {
        constructor(
            public readonly text: string,
            public readonly color: string,
            public readonly borderColor: string
        ) {
        }
    }

    export let repository = new Base.Repository<Entity>();

    export function construct(json: Array<any>): Array<number> {
        let result = [];
        for (let category of json) {
            const color = category.color ? category.color : '#ff8392';
            const borderColor = category["border-color"] ? category["border-color"] : shadeColor(color, -0.4);
            result.push(category.id);
            repository.set(category.id, new Entity(category.text, color, borderColor));
        }
        return result;
    }
}