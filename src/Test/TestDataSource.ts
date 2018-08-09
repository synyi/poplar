import {JsonDataSource} from "../Annotator/DataSource/JsonDataSource";

export class TestDataSource extends JsonDataSource {
    constructor() {
        super({
            "content": "0123456789。1123456789。212345678931234567894123456789。\n123456789\n123456789",
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
            "labels": [
                {
                    "id": 0,
                    "categoryId": 0,
                    "startIndex": 17,
                    "endIndex": 19
                },
                {
                    "id": 1,
                    "categoryId": 0,
                    "startIndex": 18,
                    "endIndex": 20
                },
                {
                    "id": 2,
                    "categoryId": 0,
                    "startIndex": 56,
                    "endIndex": 58
                }
            ],
            "connectionCategories": [
                {
                    "id": 0,
                    "text": "测试2"
                }, {
                    "id": 1,
                    "text": "测试3"
                }
            ],
            "connections": [
                {
                    "id": 0,
                    "categoryId": 0,
                    "fromId": 0,
                    "toId": 0
                }, {
                    "id": 2,
                    "categoryId": 0,
                    "fromId": 1,
                    "toId": 2
                }
            ]
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
