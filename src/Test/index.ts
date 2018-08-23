import {Annotator} from "../Annotator/Annotator";
import {Action} from "../Annotator/Action/Action";

(window as any).annotator = new Annotator(
    {
        "content": "Hello",
        "labelCategories": [{"id": "0", "text": "测试0", "color": "#eac0a2", "border-color": "#8c7361"}],
        "labels": [],
        "connectionCategories": [{"id": "0", "text": "测试1"}],
        "connections": []
    },
    document.getElementById('container')
);

(window as any).annotator.on('textSelected', (e) => {
    console.log('textSelected', e);
});

(window as any).annotator.on('labelClicked', (e) => {
    console.log('labelClicked', e);
});

(window as any).annotator.on('labelRightClicked', (e, x, y) => {
    console.log('labelRightClicked', e, x, y);
});

(window as any).annotator.on('twoLabelsClicked', (id1, id2) => {
    console.log('twoLabelsClicked', id1, id2);
});

(window as any).annotator.on('connectionRightClicked', (e) => {
    console.log('connectionRightClicked', e);
});

(window as any).Action = Action;
