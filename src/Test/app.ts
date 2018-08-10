import {Annotator, AnnotatorConfig, RenderBehaviourOptions} from "../Annotator/Annotator";
import {TestDataManager} from "./TestDataManager";
import {AddLabelAction} from "../Annotator/Action/AddLabel";
import {AddConnectionAction} from "../Annotator/Action/AddConnection";

let element = document.createElement("div");
document.body.appendChild(element);
let dataManager = new TestDataManager();
(window as any).annotator = new Annotator(dataManager, element, new AnnotatorConfig(RenderBehaviourOptions.ONE_SHOT, 80));
(window as any).annotator.on('textSelected', (selectionInfo) => {
    AddLabelAction.emit(dataManager.labelCategories[0], selectionInfo.startIndex, selectionInfo.endIndex);
});
(window as any).annotator.on('labelsConnected', (first, second) => {
    AddConnectionAction.emit(dataManager.connectionCategories[0], first, second);
});