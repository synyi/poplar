// when I am lazy
// singleton is static
// class is variable
// and I love Kotlin
import {Dispatcher} from "../Dispatcher/Dispatcher";
import {Label} from "../Store/Label";
import {Action} from "./Action";

export class AddConnectionAction implements Action {
    actionType = 'AddConnectionAction';

    protected constructor(public from: Label, public to: Label) {
    }

    static emit(from: Label, to: Label) {
        let theAction = new AddConnectionAction(from, to);
        Dispatcher.dispatch(theAction);
    }
}