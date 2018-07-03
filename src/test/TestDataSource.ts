import {AnnotatorDataSource} from "../annotator/Store/AnnotatorDataSource";
import {Connection} from "../annotator/Store/Connection";
import {Label} from "../annotator/Store/Label";

export class TestDataSource implements AnnotatorDataSource {
    addConnection(connection: Connection) {
    }

    addLabel(label: Label) {
    }

    getRawContent(): string {
        return "测试。\n测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试。测试？测试！\n测试\n测试。";
    }

    getLabels(): Array<{ text: string; startIndexInRawContent: number; endIndexInRawContent: number }> {
        return [
            {text: '测试', startIndexInRawContent: 0, endIndexInRawContent: 2},
            {text: '测试', startIndexInRawContent: 5, endIndexInRawContent: 7},
            {text: '测试测试', startIndexInRawContent: 10, endIndexInRawContent: 14},
            {text: '测试测试', startIndexInRawContent: 15, endIndexInRawContent: 25},
        ];
    }

}