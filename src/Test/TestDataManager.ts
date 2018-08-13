import {JsonDataManager} from "../Annotator/DataManager/JsonDataManager";

export class TestDataManager extends JsonDataManager {
    constructor() {
        super({
            "content": "012345678。112345678！223456789\n323456789\n423456789",
            "labelCategories": [{
                "id": "0",
                "text": "测试0",
                "color": "#eac0a2",
                "border-color": "#8c7361"
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
        });
    }
}
