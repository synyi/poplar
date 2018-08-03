import {DataSource} from "../../../Annotator/Store/DataSource";
import {Label} from "../../../Annotator/Store/Label";
import {Store} from "../../../Annotator/Store/Store";
import {expect} from "chai";
import {Connection} from "../../../Annotator/Store/Connection";

class StubDataSource implements DataSource {
    labels = [];

    getLabels(): Array<Label> {
        return this.labels;
    }

    getRawContent(): string {
        return "012345678 。123456789！ 23456789？";
    }

    public async requireLabelText(): Promise<string> {
        return new Promise<string>((resolve, _) => {
            resolve('测试');
        });
    }

    addLabel(label: Label) {
        this.labels.push(label);
    }

    getConnections(): Array<Connection> {
        return undefined;
    }

    requireConnectionText(): Promise<string> {
        return undefined;
    }
}

describe('Sentence', () => {
    let store = new Store(new StubDataSource());
    it('被正确地构造了', () => {
        let sentences = store.children[0].children;
        expect(sentences.length).equals(3);
        expect(sentences[0].globalStartIndex).equals(0);
        expect(sentences[0].globalEndIndex).equals(11);
        expect(sentences[0].toString()).equals('012345678 。');

        expect(sentences[1].globalStartIndex).equals(11);
        expect(sentences[1].globalEndIndex).equals(21);
        expect(sentences[1].toString()).equals('123456789！');

        expect(sentences[2].globalStartIndex).equals(22);
        expect(sentences[2].globalEndIndex).equals(31);
        expect(sentences[2].toString()).equals('23456789？');
    });
    // it('能正确处理添加label', (done) => {
    //     AddLabelAction.emit(1, 4);
    //     AddLabelAction.emit(12, 14);
    //     setTimeout(() => {
    //         let sentences = store.children[0].children;
    //         expect(sentences[0].labels.length).equals(1);
    //         expect(sentences[0].labels[0].globalStartIndex).equals(1);
    //         expect(sentences[0].labels[0].globalEndIndex).equals(4);
    //         expect(sentences[0].labels[0].startIndexIn(sentences[0])).equals(1);
    //         expect(sentences[0].labels[0].endIndexIn(sentences[0])).equals(4);
    //
    //         expect(sentences[1].labels.length).equals(1);
    //         expect(sentences[1].labels[0].globalStartIndex).equals(12);
    //         expect(sentences[1].labels[0].globalEndIndex).equals(14);
    //         expect(sentences[1].labels[0].startIndexIn(sentences[1])).equals(1);
    //         expect(sentences[1].labels[0].endIndexIn(sentences[1])).equals(3);
    //
    //
    //         done();
    //     }, 1);
    // });
    // it('能正确的合并', (done) => {
    //     AddLabelAction.emit(8, 12);
    //     setTimeout(() => {
    //         let sentences = store.children[0].children;
    //         expect(sentences.length).equals(2);
    //         expect(sentences[0].labels.length).equals(3);
    //         done();
    //     }, 1);
    // });
});