import {EventBus} from "../../Tools/EventBus";
import {Connection} from "../Connection";

export class ConnectionAdded {
    static eventName = 'ConnectionAdded';

    constructor(public connection: Connection) {
    }

    emit() {
        EventBus.emit(ConnectionAdded.eventName, this);
    }
}