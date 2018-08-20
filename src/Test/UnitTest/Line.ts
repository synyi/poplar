import {expect} from "chai";
import {Store} from "../../Annotator/Store/Store";
import {Line} from "../../Annotator/Store/Entities/Line";
import {Label} from "../../Annotator/Store/Entities/Label";

describe('Line', () => {
    it('被正确构造了', () => {
        let store = new Store();
        store.content = "012345678。 123456789！  3456789!\n" +
            "0123456789 \n 2345678 \n01234567890123456789";
        store.config.maxLineWidth = 10;
        const lines = Line.construct(store);
        expect(lines[0].text).equals("012345678。");
        expect(lines[1].text).equals("123456789！");
        expect(lines[2].text).equals("3456789!");
        expect(lines[3].text).equals("0123456789");
        expect(lines[4].text).equals("2345678");
        expect(lines[5].text).equals("0123456789");
        expect(lines[6].text).equals("0123456789");
    });
    it('在添加Label后能被正确合并', () => {
        let store = new Store();
        store.content = "012345678。 123456789！  3456789!\n" +
            "0123456789 \n 2345678 \n01234567890123456789";
        store.config.maxLineWidth = 10;
        Line.construct(store).map(it => store.lineRepo.add(it));
        store.labelRepo.add(new Label.Entity(null, 0, 8, 12));
        expect(store.lineRepo.get(0).text).equals('012345678。 123456789！');
        expect(store.lineRepo.has(1)).false();
    });
});