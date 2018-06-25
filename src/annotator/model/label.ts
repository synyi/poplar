import {Sentence} from "./sentence";
import {Connection} from "./connection";
import {EventBase} from "../../library/EventBase";

export class Label extends EventBase {
    private relationsIn: Array<Connection>;
    private relationsOut: Array<Connection>;

    constructor(
        private belongTo: Sentence,
        private category: string,
        private startIndexInSentence: number,
        private endIndexInSentence: number
    ) {
        super();
        belongTo.onCreateLabel(this);
        this.emit("label_created", this);
    }

    public stringContent(): string {
        return this.belongTo.slice(this.startIndexInSentence, this.endIndexInSentence)
    }
}