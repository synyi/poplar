import {AnnotatorDataSource} from "../../../annotator/Store/AnnotatorDataSource";
import {Connection} from "../../../annotator/Store/Connection";
import {Label} from "../../../annotator/Store/Label";
import {Store} from "../../../annotator/Store/Store";

let expect = require('chai').expect;

class DummyDataSource implements AnnotatorDataSource {
    labels = [
        // new Label('测试', 0, 4),
        // new Label('测试', 6, 7),
        // new Label('测试测试', 10, 14),
        // new Label('测试测试', 15, 25),
        // new Label('测试测试', 81, 85)
    ];

    addConnection(connection: Connection) {
    }

    addLabel(label: Label) {
        this.labels.push(label);
    }

    getRawContent(): string {
        // 实际计算时，不计算空白字符
        //      0 123       4 56 7 89   0 1  2 34   5
        return "测试 。\n\n\n测试？测试！\n测试\n测试。\n测试。\n测试。";
    }

    getLabels(): Array<Label> {
        return this.labels;
    }
}

describe('Store', function () {
    describe('test if the Store object can be constructed properly', () => {
        it('we can construct the object', () => {
            let store = new Store(new DummyDataSource());
            expect(store.paragraphs.map(it => it.toString())).to.be.equal(['测试 。', '测试？', '测试！', '测试', '测试。', '测试。', '测试。']);
        })
    })
});