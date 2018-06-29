import {Label} from "../Store/Label";
import {Dispatcher} from "../Dispatcher/Dispatcher";
import {Action} from "./Action";

export class ConnectLabelAction implements Action {
    actionType = 'ConnectLabelAction';

    constructor(public text: string, public labelFrom: Label, public labelTo: Label) {
    }


    static emit(text: string, labelFrom: Label, labelTo: Label) {
        let theAction = new ConnectLabelAction(text, labelFrom, labelTo);
        Dispatcher.dispatch(theAction);
    }
}
