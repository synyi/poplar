import {Action} from "./Action";
import {Connection} from "../Store/Element/Connection/Connection";
import {Dispatcher} from "../Dispatcher/Dispatcher";

export class DeleteConnectionAction implements Action {
    actionType = 'DeleteConnectionAction';

    constructor(public connection: Connection) {

    }

    static emit(connection: Connection) {
        Dispatcher.dispatch(new DeleteConnectionAction(connection));
    }
}