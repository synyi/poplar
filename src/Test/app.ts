import {Annotator} from "../Annotator/Annotator";
import {LazyRenderBehaviour} from "../Annotator/View/Element/Root/RenderBehaviour/LazyRenderBehaviour";
import TestDataSource from "./TestDataSource";

let element = document.createElement("div");
document.body.appendChild(element);
(window as any).annotator = new Annotator(new TestDataSource(), element, new LazyRenderBehaviour());
