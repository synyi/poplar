import {AnnotatorDataSource} from "../annotator/Store/AnnotatorDataSource";
import {Connection} from "../annotator/Store/Connection";
import {Label} from "../annotator/Store/Label";

export class TestDataSource implements AnnotatorDataSource {
    addConnection(connection: Connection) {
    }

    addLabel(label: Label) {
    }

    getRawContent(): string {
        return "测试。\n测试测试测试测试测试测试测试。测试？测试！\n测试\n测试。";
    }

}