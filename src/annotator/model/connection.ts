import {Label} from "./label";
import {EventBase} from "../../library/EventBase";

export class Connection extends EventBase {
    constructor(
        private from: Label,
        private to: Label,
        private type: string
    ) {
        super();
        this.emit("connection_created", this)
    }

}