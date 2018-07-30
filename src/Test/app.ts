import {Annotator} from "../Annotator/Annotator";
import {LazyRenderBehaviour} from "../Annotator/View/Element/Root/RenderBehaviour/LazyRenderBehaviour";
import TestDataSourceLong from "./TestDataSourceLong";

let element = document.createElement("div");
document.body.appendChild(element);
(window as any).annotator = new Annotator(new TestDataSourceLong(), element, new LazyRenderBehaviour());
