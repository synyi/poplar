import {AnnotatorDataSource} from "../annotator/Store/AnnotatorDataSource";
import {Connection} from "../annotator/Store/Connection";
import {Label} from "../annotator/Store/Label";

export class TestDataSource implements AnnotatorDataSource {
    labels = [
        // new Label('测试', 0, 5),
        // new Label('测试', 6, 7),
        // new Label('测试测试', 10, 14),
        // new Label('测试测试', 19, 23),
        // new Label('测试测试', 81, 85)
    ];

    addConnection(connection: Connection) {
    }

    addLabel(label: Label) {
        this.labels.push(label);
    }

    getRawContent(): string {
        // 实际计算时，不计算空白字符
        //      0 123       4 567 8 901   2 34  5 678   9 012   3 456
        return "测试。\n测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试。" +
            "测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测测试测试测试测试测试。\n" +
            "测试。\n" +
            "测试？\n" +
            "测试！\n" +
            "测试。";
    }

    getLabels(): Array<Label> {
        return this.labels;
    }
}