import {DataSource} from "../../../Annotator/Store/DataSource";
import {Label} from "../../../Annotator/Store/Label";
import {Store} from "../../../Annotator/Store/Store";
import {expect} from "chai";
import {AddLabelAction} from "../../../Annotator/Action/AddLabel";

class StubDataSource implements DataSource {
    labels = [];

    getLabels(): Array<Label> {
        return this.labels;
    }

    getRawContent(): string {
        return "012345678。 \n 3456789！\n23456789？123456789？";
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

describe('Paragraph', () => {
    let store = new Store(new StubDataSource());
    it('被正确地构造了', () => {
        let paragraphs = store.children;
        expect(paragraphs.length).equals(3);
        expect(paragraphs[0].globalStartIndex).equals(0);
        expect(paragraphs[0].globalEndIndex).equals(10);
        expect(paragraphs[0].toString()).equals('012345678。');

        expect(paragraphs[1].globalStartIndex).equals(13);
        expect(paragraphs[1].globalEndIndex).equals(21);
        expect(paragraphs[1].toString()).equals('3456789！');
    });
    it('能正确处理添加label', (done) => {
        AddLabelAction.emit(14, 19);
        setTimeout(() => {
            let paragraphs = store.children;
            expect(paragraphs[1].labels.length).equals(1);
            expect(paragraphs[1].labels[0].globalStartIndex).equals(14);
            expect(paragraphs[1].labels[0].globalEndIndex).equals(19);
            expect(paragraphs[1].labels[0].endIndexIn(paragraphs[1])).equals(6);
            done();
        }, 1);
    });
    it('能正确的合并', (done) => {
        AddLabelAction.emit(1, 4);
        AddLabelAction.emit(8, 32);
        setTimeout(() => {
            let paragraphs = store.children;
            expect(paragraphs.length).equals(1);
            expect(paragraphs[0].children.length).equals(1);
            expect(paragraphs[0].children[0].globalStartIndex).equals(0);
            expect(paragraphs[0].children[0].globalEndIndex).equals(41);
            expect(paragraphs[0].children[0].labels.length).greaterThan(1);
            done();
        }, 10);
    });
});