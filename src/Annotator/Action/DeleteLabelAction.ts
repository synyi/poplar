import {Action} from "./Action";
import {Dispatcher} from "../Dispatcher/Dispatcher";
import {Label} from "../Store/Element/Label/Label";

export class DeleteLabelAction implements Action {
    actionType = 'DeleteLabelAction';

    protected constructor(public label: Label) {
    }

    static emit(label: Label) {
        let theAction = new DeleteLabelAction(label);
        Dispatcher.dispatch(theAction);
    }
}