import {LabelView} from "./Element/LabelView";
import {AddConnectionAction} from "../Action/AddConnectionAction";

// when I am lazy
// static means single instance
// variable is a class
// and I like "object" Kotlin's
export class LabelSelectionHandler {
    static lastClicked: LabelView = null;

    static labelClicked(labelView: LabelView) {
        if (LabelSelectionHandler.lastClicked === null) {
            LabelSelectionHandler.lastClicked = labelView;
        } else {
            AddConnectionAction.emit(LabelSelectionHandler.lastClicked.store, labelView.store);
            LabelSelectionHandler.lastClicked = null;
        }
    }

    static clear() {
        LabelSelectionHandler.lastClicked = null;
    }
}