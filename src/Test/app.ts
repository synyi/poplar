import {Annotator} from "../Annotator/Annotator";
import {OneShotRenderBehaviour} from "../Annotator/View/Element/Root/RenderBehaviour/OneShotRenderBehaviour";
import TestDataSourceLong from "./TestDataSourceLong";

let element = document.createElement("div");
document.body.appendChild(element);
(window as any).annotator = new Annotator(new TestDataSourceLong(), element, new OneShotRenderBehaviour());
