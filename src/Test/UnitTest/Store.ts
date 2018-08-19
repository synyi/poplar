import {Store} from "../../Annotator/Domain/Store";
import {expect} from "chai";

describe('Store', () => {
    it('能正确解析JSON', () => {
        const store = new Store();
        store.json = {
            "content": "012345678。112345678！223456789\n323456789\n423456789",
            "labelCategories": [{
                "id": "0",
                "text": "测试0",
                "color": "#eac0a2",
                "border-color": "#8c7361"
            }, {
                "id": "1",
                "text": "测试1",
                "color": "#c673E0",
                "border-color": "#8106a9"
            }],
            "labels": [{
                "id": "0",
                "categoryId": "0",
                "startIndex": 25,
                "endIndex": 28
            }, {
                "id": "1",
                "categoryId": "0",
                "startIndex": 12,
                "endIndex": 15
            }],
            "connectionCategories": [{
                "id": "0",
                "text": "测试1"
            }, {
                "id": "1",
                "text": "测试2"
            }],
            "connections": [{
                "id": "0",
                "categoryId": "0",
                "fromId": "1",
                "toId": "0"
            }, {
                "id": "1",
                "categoryId": "1",
                "fromId": "0",
                "toId": "1"
            }]
        };
        expect(store.labelCategoryRepo.get(store.labelRepo.get(0).categoryId).text).equals('测试0');
        expect(store.labelRepo.get(0).endIndex).equals(28);
        expect(store.labelRepo.get(store.connectionRepo.get(1).toId).startIndex).equals(12);
    });
});