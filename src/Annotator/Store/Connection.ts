import {Label} from "./Label";

export class Connection {
    constructor(
        public text: string,
        public from: Label,
        public to: Label
    ) {
        from.connectionsFromThis.add(this);
        to.connectionToThis.add(this);
    }
}