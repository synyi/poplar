import {AnnotatorDataSource} from "../annotator/Store/AnnotatorDataSource";
import {Connection} from "../annotator/Store/Connection";
import {Label} from "../annotator/Store/Label";

export class TestDataSource implements AnnotatorDataSource {
    addConnection(connection: Connection) {
    }

    addLabel(label: Label) {
    }

    getRawContent(): string {
        return "测试。\n123456789022345678903234567890423456789052345678906234567890723456789082345678909234567890023456789012345678902234567890323456789042345678905234567890623456789。测试？测试！\n测试\n测试。";
    }

    getLabels(): Array<{ text: string; startIndexInRawContent: number; endIndexInRawContent: number }> {
        return [
            {text: '测试', startIndexInRawContent: 0, endIndexInRawContent: 2},
            {text: '测试', startIndexInRawContent: 5, endIndexInRawContent: 7},
            {text: '测试测试', startIndexInRawContent: 10, endIndexInRawContent: 14},
            {text: '测试测试', startIndexInRawContent: 15, endIndexInRawContent: 25},
            // {text: '测试测试', startIndexInRawContent: 80, endIndexInRawContent: 90},
        ];
    }

}