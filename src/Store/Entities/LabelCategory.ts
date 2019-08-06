import {Base} from "../../Infrastructure/Repository";
import {Store} from "../Store";
import {shadeColor} from "../../Infrastructure/color";

export namespace LabelCategory {
    export interface Entity {
        readonly id: number;
        readonly text: string;
        readonly color: string;
        readonly borderColor: string;
    }

    interface EntityJson extends JSON {
        readonly id: string;
        readonly text: string;
        readonly color?: string;
        readonly borderColor?: string;
        readonly "border-color"?: string;
    }

    export class Repository extends Base.Repository<Entity> {
        readonly root: Store;

        constructor(root: Store) {
            super(root);
        }
    }

    export function construct(json: EntityJson): Entity {
        let borderColor = json.borderColor;
        let color = json.color;
        if (!(json.borderColor) && json["border-color"]) {
            borderColor = json["border-color"];
        }
        if (!(json.color)) {
            color = "#ff9d61";
        }
        if (!(json.borderColor)) {
            borderColor = shadeColor(color, 30);
        }
        return {
            id: parseInt(json.id),
            text: json.text,
            color,
            borderColor
        };
    }

    export function constructAll(json: Array<any>): Array<Entity> {
        return json.map(construct);
    }
}
