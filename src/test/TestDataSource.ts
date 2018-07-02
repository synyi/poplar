import {AnnotatorDataSource} from "../annotator/Store/AnnotatorDataSource";
import {Connection} from "../annotator/Store/Connection";
import {Label} from "../annotator/Store/Label";

export class TestDataSource implements AnnotatorDataSource {
    addConnection(connection: Connection) {
    }

    addLabel(label: Label) {
    }

    getRawContent(): string {
        return "期望。\n片尾曲放入额去哦就哦就阿东 i就哦阿双方将阿斯顿激发教师的法律将阿斯顿来反馈卡上打飞机啦十分简单啊；路上的风景凯迪拉克设计法律上看风景卢卡斯大结局啦四级大风将阿斯顿来看风景啊老师；看风景啊老师看到飞机离开；阿斯顿风景啦上课；对减肥啦上课的风景啦啥都看风景！\n过后\n即可。";
    }

    getLabels(): Array<{ text: string; startIndexInRawContent: number; endIndexInRawContent: number }> {
        return [
            {text: '测试', startIndexInRawContent: 0, endIndexInRawContent: 2},
            {text: '测试', startIndexInRawContent: 5, endIndexInRawContent: 7},
            {text: '测试测试', startIndexInRawContent: 10, endIndexInRawContent: 14},
            {text: '测试测试', startIndexInRawContent: 15, endIndexInRawContent: 25},
            // {text: '测试-', startIndexInRawContent: 32, endIndexInRawContent: 33},
        ];
    }

}