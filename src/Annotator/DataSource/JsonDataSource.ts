import {DataSource} from "./DataSource";
import {Connection} from "../Store/Element/Connection/Connection";
import {Label} from "../Store/Element/Label/Label";
import {LabelCategory} from "../Store/Element/Label/LabelCategory";
import {ConnectionCategory} from "../Store/Element/Connection/ConnectionCategory";


/**
 * thanks to Pimp Trizkit (function for darken color)
 * @see https://stackoverflow.com/questions/5560248/programmatically-lighten-or-darken-a-hex-color-or-rgb-and-blend-colors
 */
function shadeColor(color, percent) {
    let f = parseInt(color.slice(1), 16), t = percent < 0 ? 0 : 255, p = percent < 0 ? percent * -1 : percent,
        R = f >> 16, G = f >> 8 & 0x00FF, B = f & 0x0000FF;
    return "#" + (0x1000000 + (Math.round((t - R) * p) + R) * 0x10000 + (Math.round((t - G) * p) + G) * 0x100 + (Math.round((t - B) * p) + B)).toString(16).slice(1);
}

export abstract class JsonDataSource implements DataSource {
    content: string = null;
    labelCategories = {};
    labels = {};
    connectionCategories = {};
    connections = {};

    protected constructor(json: string | object) {
        let obj: any = {};
        if (typeof json === "string")
            obj = JSON.parse(json);
        else
            obj = json;
        this.content = obj.content;
        for (let labelCategory of obj.labelCategories) {
            const color = labelCategory.color ? labelCategory.color : '#ff8392';
            const borderColor = labelCategory["border-color"] ? labelCategory["border-color"] : shadeColor(color, -0.4);
            this.labelCategories[labelCategory.id] =
                new LabelCategory(labelCategory.text,
                    color,
                    borderColor);
        }
        for (let label of obj.labels) {
            this.labels[label.id] = new Label(this.labelCategories[label.categoryId], label.startIndex, label.endIndex);
        }
        for (let connectionCategory of obj.connectionCategories) {
            this.connectionCategories[connectionCategory.id] =
                new ConnectionCategory(connectionCategory.text);
        }
        for (let connection of obj.connections) {
            this.connections[connection.id] =
                new Connection(this.connectionCategories[connection.categoryId], this.labels[connection.fromId], this.labels[connection.toId]);
        }
    }

    get json(): string {
        let obj: any = {};
        obj.content = this.content;
        obj.labelCategories = [];
        for (let categoryId in this.labelCategories) {
            obj.labelCategories.push({
                id: categoryId,
                text: this.labelCategories[categoryId].text,
                color: this.labelCategories[categoryId].color,
                "border-color": this.labelCategories[categoryId].borderColor
            });
        }
        obj.labels = [];
        for (let labelId in this.labels) {
            obj.labels.push({
                id: labelId,
                categoryId: this.labelCategoryId(this.labels[labelId].category),
                startIndex: this.labels[labelId].startIndex,
                endIndex: this.labels[labelId].endIndex
            });
        }
        obj.connectionCategories = [];
        for (let categoryId in this.connectionCategories) {
            obj.connectionCategories.push({
                id: categoryId,
                text: this.connectionCategories[categoryId].text
            });
        }

        obj.connections = [];
        for (let connectionId in this.connections) {
            obj.connections.push({
                id: connectionId,
                categoryId: this.connectionCategoryId(this.connections[connectionId].category),
                fromId: this.labelId(this.connections[connectionId].from),
                toId: this.labelId(this.connections[connectionId].to)
            });
        }
        return JSON.stringify(obj);
    }

    addConnection(connection: Connection) {
        let maxIndex = Number.MIN_SAFE_INTEGER;
        for (let connectionIndex in this.connections) {
            if (connectionIndex as any as number > maxIndex) {
                maxIndex = connectionIndex as any as number;
            }
        }
        this.connections[maxIndex + 1] = connection;
    }

    addLabel(label: Label) {
        let maxIndex = Number.MIN_SAFE_INTEGER;
        for (let labelIndex in this.labels) {
            if (labelIndex as any as number > maxIndex) {
                maxIndex = labelIndex as any as number;
            }
        }
        this.labels[maxIndex + 1] = label;
    }

    getConnections(): Array<Connection> {
        let result = [];
        for (let conn in this.connections) {
            result.push(this.connections[conn]);
        }
        return result;
    }

    getLabels(): Array<Label> {
        let result = [];
        for (let label in this.labels) {
            result.push(this.labels[label]);
        }
        return result;
    }

    getRawContent(): string {
        return this.content;
    }

    abstract async requireConnectionCategoryId(): Promise<number>;

    abstract async requireLabelCategoryId(): Promise<number>;

    async requireConnectionCategory(): Promise<ConnectionCategory> {
        let id = await this.requireConnectionCategoryId();
        return new Promise<ConnectionCategory>((resolve) => {
            resolve(this.connectionCategories[id]);
        });
    }

    async requireLabelCategory(): Promise<LabelCategory> {
        let id = await this.requireLabelCategoryId();
        return new Promise<LabelCategory>((resolve) => {
            resolve(this.labelCategories[id]);
        });
    }

    private labelCategoryId(category: LabelCategory): number {
        for (let categoryId in this.labelCategories) {
            if (this.labelCategories[categoryId] === category) {
                return categoryId as any as number;
            }
        }
        return null;
    }

    private connectionCategoryId(category: LabelCategory): number {
        for (let connectionId in this.connectionCategories) {
            if (this.labelCategories[connectionId] === category) {
                return connectionId as any as number;
            }
        }
        return null;
    }

    private labelId(label: Label): number {
        for (let labelId in this.labels) {
            if (this.labels[labelId] === label) {
                return labelId as any as number;
            }
        }
        return null
    }
}