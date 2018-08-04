import {DataSource} from "../Annotator/Store/DataSource";
import {Label} from "../Annotator/Store/Label";
import {Connection} from "../Annotator/Store/Connection";

export default class TestDataSource implements DataSource {
    labels = [
        new Label("测试0", 11, 16),
        new Label("测试1", 18, 20),
        new Label("测试2", 23, 28),
    ];
    id = 3;

    getLabels(): Array<Label> {
        return this.labels;
    }

    getRawContent(): string {
        return "0123456789。" +
            "1123456789。" +
            "2123456789" +
            "3123456789" +
            "4123456789。" +
            "\n123456789" +
            "\n123456789";
    }

    public async requireConnectionText(): Promise<string> {
        return new Promise<string>((resolve, _) => {
            resolve('连接' + ++this.id);
        });
    }

    public async requireLabelText(): Promise<string> {
        return new Promise<string>((resolve, _) => {
            resolve('测试' + ++this.id);
        });
    }

    addLabel(label: Label) {
        this.labels.push(label);
    }

    getConnections(): Array<Connection> {
        return [
            new Connection('链接00', this.labels[0], this.labels[0]),
            // new Connection('链接01', this.labels[0], this.labels[1]),
            // new Connection('链接10', this.labels[1], this.labels[0]),
            // new Connection('链接02', this.labels[0], this.labels[2]),
            // new Connection('链接03', this.labels[0], this.labels[1]),
            // new Connection('链接32', this.labels[3], this.labels[2])
        ];
    }

    addConnection(connection: Connection) {
    }
}