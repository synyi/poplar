import {Annotator} from "../Annotator/Annotator";
import {Action} from "../Annotator/Action/Action";

(window as any).annotator = new Annotator(
    {
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
        }, {
            "id": "2",
            "categoryId": "1",
            "startIndex": 13,
            "endIndex": 16
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
        }]
    },
    document.getElementById('container')
);

(window as any).annotator.on('textSelected', (e) => {
    console.log(e);
});

(window as any).Action = Action;
