import {Annotator} from "../Annotator/Annotator";
import {RenderMode} from "../Annotator/View/View";
import TestDataSource from "./TestDataSource";

let element = document.createElement("div");
document.body.appendChild(element);
let annotator = new Annotator(new TestDataSource(), element, RenderMode.Lazy);
let renderNext = () => {
    annotator.view.root.render(annotator.view.svgElement);
    annotator.view.svgElement.size(annotator.view.root.svgElement.node.getBoundingClientRect().width + 20, annotator.view.root.svgElement.node.getBoundingClientRect().height + 100);
    setTimeout(() => {
        renderNext();
    }, 1000);
};
setTimeout(() => {
    renderNext();
}, 1000);

