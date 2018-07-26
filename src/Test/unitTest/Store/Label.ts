import {Label} from "../../../Annotator/Store/Label";
import {expect} from "chai";

describe('Label', () => {
    let theLabel: Label;
    it('被正确的构造了', () => {
        theLabel = new Label('测试', 5, 10);
    });
    it('能正确地被比较', () => {
        let otherLabel = new Label('测试', 3, 7);
        expect(Label.compare(otherLabel, theLabel)).lessThan(0);
        otherLabel = new Label('测试', 8, 20);
        expect(Label.compare(otherLabel, theLabel)).greaterThan(0);
        otherLabel = new Label('测试', 5, 7);
        expect(Label.compare(otherLabel, theLabel)).lessThan(0);
        otherLabel = new Label('测试', 5, 12);
        expect(Label.compare(otherLabel, theLabel)).greaterThan(0);
        otherLabel = new Label('测试', 5, 12);
        expect(Label.compare(otherLabel, theLabel)).greaterThan(0);
        otherLabel = new Label('测试', 5, 10);
        expect(Label.compare(otherLabel, theLabel)).equals(0);
    });
});