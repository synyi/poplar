import {Label} from "./Label";
import {EventEmitter} from "events";
import {fromEvent} from "rxjs";

export class Connection {
    private static eventEmitter = new EventEmitter();
    static constructed$ = fromEvent(Connection.eventEmitter, 'constructed');

    constructor(
        public text: string,
        public from: Label,
        public to: Label
    ) {
        from.connectionsFromThis.add(this);
        to.connectionsToThis.add(this);
        Connection.eventEmitter.emit('constructed', this);
    }
}