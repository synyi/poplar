import {DataSource} from "../../../Annotator/Store/DataSource";
import {Label} from "../../../Annotator/Store/Label";
import {Store} from "../../../Annotator/Store/Store";
import {expect} from 'chai';

class StubDataSource implements DataSource {
    getLabels(): Array<Label> {
        return [];
    }

    getRawContent(): string {
        return "\n\n  测试。\n\n" +
            "  测试 。  测试，测试？！  ？ ！   测试测试\n" +
            "测试 \n" +
            "测试测试  \n";
    }

    public async requireText(): Promise<string> {
        return new Promise<string>((resolve, _) => {
            resolve('');
        });
    }

    addLabel(label: Label) {
    }

}

class StubDataSource2 implements DataSource {
    getLabels(): Array<Label> {
        return [];
    }

    getRawContent(): string {
        return "0123456789\n123456789\n123456789";
    }

    public async requireText(): Promise<string> {
        return new Promise<string>((resolve, _) => {
            resolve('');
        });
    }

    addLabel(label: Label) {
    }

}

describe('Store正确地构造出来了', () => {
    let store = new Store(new StubDataSource());
    it('将文本解析成几个段', () => {
        let paragraphs = store.paragraphs.map(it => it.toString());
        expect(paragraphs).not.include("\n\n");
        expect(paragraphs).include("测试。");
        expect(paragraphs).include("测试 。  测试，测试？！  ？ ！   测试测试");
        expect(paragraphs).include("测试测试");
    });
    it('将段又分成句', () => {
        let theParagraph = store.paragraphs[1];
        expect(theParagraph.toString()).equals("测试 。  测试，测试？！  ？ ！   测试测试");
        let sentences = theParagraph.sentences.map(it => it.toString());
        expect(sentences).include("测试 。");
        expect(sentences).not.include("\n\n");
        expect(sentences).include("测试，测试？！  ？ ！");
        expect(sentences).include("测试测试");
    });
    it('加入标注会让段合并起来', () => {
        let mergeResult = store.addLabel(new Label("测试", 6, 13));
        let mergedParagraphs = mergeResult.mergedParagraphs.map(it => it.toString());
        expect(mergedParagraphs).include("测试。");
        expect(mergedParagraphs).include("测试 。  测试，测试？！  ？ ！   测试测试");
        let paragraphs = store.paragraphs.map(it => it.toString());
        expect(paragraphs).not.include("测试。");
        expect(paragraphs).not.include("测试 。  测试，测试？！  ？ ！   测试测试");
        expect(paragraphs).include("测试。\n\n  测试 。  测试，测试？！  ？ ！   测试测试");
        expect(paragraphs).include("测试测试");
    });
    it('连续添加', () => {
        let store2 = new Store(new StubDataSource2());
        store2.addLabel(new Label("测试", 9, 12));
        expect(store2.paragraphs.length).equals(2);
        expect(store2.paragraphs[0].sentences.length).equals(1);
        expect(store2.paragraphs[0].sentences[0].toString()).equals("0123456789\n123456789");
        expect(store2.paragraphs[1].sentences.length).equals(1);
        expect(store2.paragraphs[1].sentences[0].toString()).equals("123456789");
        store2.addLabel(new Label("测试", 19, 22));
        expect(store2.paragraphs.length).equals(1);
        expect(store2.paragraphs[0].sentences.length).equals(1);
    });
    it('还会让句子合并起来', () => {
        let theParagraph = store.paragraphs[0];
        expect(theParagraph.toString()).equals("测试。\n\n  测试 。  测试，测试？！  ？ ！   测试测试");
        let sentences = theParagraph.sentences.map(it => it.toString());
        expect(sentences).include("测试。\n\n  测试 。");
        expect(sentences).include("测试测试");
        let mergeResult = store.addLabel(new Label("测试", 14, 19));
        let mergedSentences = mergeResult.mergedSentences.map(it => it.toString());
        expect(mergedSentences).include("测试。\n\n  测试 。");
        expect(mergedSentences).include("测试，测试？！  ？ ！");
        sentences = theParagraph.sentences.map(it => it.toString());
        expect(sentences).not.include("\n\n");
        expect(sentences).not.include("测试 。");
        expect(sentences).not.include("测试，测试？！  ？ ！");
        expect(sentences).include("测试。\n\n  测试 。  测试，测试？！  ？ ！");
    });
});