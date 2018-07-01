import {Label} from "./Label";
import {Connection} from "./Connection";

export interface AnnotatorDataSource {
    getRawContent(): string

    getLabels(): Array<{
        text: string,
        startIndexInRawContent: number,
        endIndexInRawContent: number
    }>

    addLabel(label: Label)

    addConnection(connection: Connection)
}