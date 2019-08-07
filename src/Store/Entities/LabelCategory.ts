import {Base} from "../../Infrastructure/Repository";
import {Store} from "../Store";
import {shadeColor} from "../../Infrastructure/Color";

export namespace LabelCategory {
    export interface JSON {
        readonly id: number;
        readonly text: string;
        readonly color?: string;
        readonly borderColor?: string;
        readonly "border-color"?: string;
    }

    export interface Entity {
        readonly id: number;
        readonly text: string;
        readonly color: string;
        readonly borderColor: string;
    }

    export class Repository extends Base.Repository<Entity> {
        readonly root: Store;

        constructor(root: Store) {
            super(root);
        }
    }

    export function construct(json: JSON, defaultColor: string): Entity {
        let borderColor = json.borderColor;
        let color = json.color;
        if (!(json.borderColor) && json["border-color"]) {
            borderColor = json["border-color"];
        }
        if (!(json.color)) {
            color = defaultColor;
        }
        if (!(json.borderColor)) {
            borderColor = shadeColor(color, 30);
        }
        return {
            id: json.id,
            text: json.text,
            color,
            borderColor
        };
    }

    export function constructAll(json: Array<JSON>, config: { readonly defaultLabelColor: string }): Array<Entity> {
        return json.map(it => construct(it, config.defaultLabelColor));
    }
}
