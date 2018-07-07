import {Action} from "./Action";
import {Dispatcher} from "../Dispatcher/Dispatcher";

export class AddLabelAction implements Action {
    actionType = 'AddLabelAction';

    constructor(public text: string,
                public startIndex: number,
                public endIndex: number) {
    }

    static emit(text: string, startIndex: number, endIndex: number) {
        let theAction = new AddLabelAction(text, startIndex, endIndex);
        Dispatcher.dispatch(theAction);
    }
}
