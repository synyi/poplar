import {Annotator} from "../Annotator/Annotator";
import {LazyRenderBehaviour} from "../Annotator/View/Element/Root/RenderBehaviour/LazyRenderBehaviour";
import TestDataSourceLong from "./TestDataSourceLong";

let element = document.createElement("div");
document.body.appendChild(element);
let annotator = new Annotator(new TestDataSourceLong(), element, new LazyRenderBehaviour());
