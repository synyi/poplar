import {Label} from "./Label";
import {Connection} from "./Connection";

export interface AnnotatorDataSource {
    getRawContent(): string

    addLabel(label: Label)

    addConnection(connection: Connection)
}