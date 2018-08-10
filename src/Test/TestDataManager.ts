import {JsonDataManager} from "../Annotator/DataSource/JsonDataManager";

export class TestDataManager extends JsonDataManager {
    constructor() {
        super({
            "content": "0123456789\n0123456789。0123456789。0123456789\n0123456789",
            "labelCategories": [
                {
                    "id": 0,
                    "text": "测试0",
                    "color": "#eac0a2"
                },
                {
                    "id": 1,
                    "text": "测试1",
                    "color": "#dcc5e5",
                    "border-color": "#000000"
                }
            ],
            "labels": [],
            "connectionCategories": [
                {
                    "id": 0,
                    "text": "测试2"
                }, {
                    "id": 1,
                    "text": "测试3"
                }
            ],
            "connections": []
        });
    }
}
