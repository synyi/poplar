import {Action} from "./Action";
import {Label} from "../Store/Label";
import {Dispatcher} from "../Dispatcher/Dispatcher";

// when I am lazy
// singleton is static
// class is variable
// and I love Kotlin
export class AddConnectionAction implements Action {
    actionType = 'AddConnectionAction';

    protected constructor(public from: Label, public to: Label) {
    }

    static emit(from: Label, to: Label) {
        let theAction = new AddConnectionAction(from, to);
        Dispatcher.dispatch(theAction);
    }
}