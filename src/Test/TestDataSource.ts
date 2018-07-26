import {DataSource} from "../Annotator/Store/DataSource";
import {Label} from "../Annotator/Store/Label";

export default class TestDataSource implements DataSource {
    labels = [
        new Label("测试", 11, 14),
        new Label("测试", 12, 14),
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

}