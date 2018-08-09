import {Annotator} from "../Annotator/Annotator";
import {TestDataSource} from "./TestDataSource";

let element = document.createElement("div");
document.body.appendChild(element);


(window as any).annotator = new Annotator(new TestDataSource(), element);