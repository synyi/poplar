import {Annotator} from "../Annotator/Annotator";
import {OneShotRenderBehaviour} from "../Annotator/View/Element/Root/RenderBehaviour/OneShotRenderBehaviour";
import TestDataSource from "./TestDataSource";

let element = document.createElement("div");
document.body.appendChild(element);
(window as any).annotator = new Annotator(new TestDataSource(), element, new OneShotRenderBehaviour());
