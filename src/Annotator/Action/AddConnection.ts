import {Dispatcher} from "../Dispatcher/Dispatcher";
import {Action} from "./Action";
import {Label} from "../Store/Element/Label/Label";
import {ConnectionCategory} from "../Store/Element/Connection/ConnectionCategory";

export class AddConnectionAction implements Action {
    actionType = 'AddConnectionAction';

    protected constructor(public category: ConnectionCategory,
                          public from: Label,
                          public to: Label) {
    }

    static emit(category: ConnectionCategory, from: Label, to: Label) {
        let theAction = new AddConnectionAction(category, from, to);
        Dispatcher.dispatch(theAction);
    }
}