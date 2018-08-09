import {Dispatcher} from "../Dispatcher/Dispatcher";
import {Action} from "./Action";
import {Label} from "../Store/Element/Label/Label";

export class AddConnectionAction implements Action {
    actionType = 'AddConnectionAction';

    protected constructor(public from: Label, public to: Label) {
    }

    static emit(from: Label, to: Label) {
        let theAction = new AddConnectionAction(from, to);
        Dispatcher.dispatch(theAction);
    }
}