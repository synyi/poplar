import {Label} from "./Label";
import {Connection} from "./Connection";

export interface AnnotatorDataSource {
    addLabel(label: Label)

    addConnection(connection: Connection)
}