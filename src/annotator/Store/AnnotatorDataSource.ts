import {Label} from "./Label";
import {Connection} from "./Connection";

export interface AnnotatorDataSource {
    getRawContent(): string

    getLabels(): Array<Label>

    addLabel(label: Label)

    addConnection(connection: Connection)
}