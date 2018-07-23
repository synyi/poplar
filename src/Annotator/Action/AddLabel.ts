import {Action} from "./Action";
import {Dispatcher} from "../Dispatcher/Dispatcher";

export class AddLabelAction implements Action {
    actionType = 'AddLabelAction';

    constructor(public startIndex: number,
                public endIndex: number) {
    }

    static emit(startIndex: number, endIndex: number) {
        let theAction = new AddLabelAction(startIndex, endIndex);
        Dispatcher.dispatch(theAction);
    }
}
