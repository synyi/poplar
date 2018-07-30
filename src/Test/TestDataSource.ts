import {DataSource} from "../Annotator/Store/DataSource";
import {Label} from "../Annotator/Store/Label";
import {Connection} from "../Annotator/Store/Connection";

export default class TestDataSource implements DataSource {
    labels = [
        new Label("测试", 11, 14),
        new Label("测试", 16, 18),
        new Label("测试", 18, 21),
    ];

    getLabels(): Array<Label> {
        return this.labels;
    }

    getRawContent(): string {
        return "0123456789。0123456789。0123456789。\n123456789\n123456789";
    }

    public async requireText(): Promise<string> {
        return new Promise<string>((resolve, _) => {
            resolve('测试');
        });
    }

    addLabel(label: Label) {
        this.labels.push(label);
    }

    getConnections(): Array<Connection> {
        return [
            new Connection('链接01', this.labels[0], this.labels[0]),
            new Connection('链接02', this.labels[0], this.labels[2]),
            new Connection('链接03', this.labels[0], this.labels[1]),
            // new Connection('链接32', this.labels[3], this.labels[2])
        ];
    }
}