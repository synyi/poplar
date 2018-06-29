import {Label} from "./Label";

export class Connection {
    constructor(private text: string,
                private fromLabel: Label,
                private toLabel: Label) {
    }
}
