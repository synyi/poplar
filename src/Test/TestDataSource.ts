import {JsonDataSource} from "../Annotator/DataSource/JsonDataSource";

export class TestDataSource extends JsonDataSource {
    constructor() {
        super({
            "content": "0123456789",
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

    async requireConnectionCategoryId(): Promise<number> {
        return new Promise<number>((resolve) => {
            resolve(1);
        });
    }

    async requireLabelCategoryId(): Promise<number> {
        return new Promise<number>((resolve) => {
            resolve(1);
        });
    }
}
