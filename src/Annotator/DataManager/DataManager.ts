import {Label} from "../Store/Element/Label/Label";
import {Connection} from "../Store/Element/Connection/Connection";

export interface DataManager {
    getRawContent(): string

    getLabels(): Array<Label>

    getConnections(): Array<Connection>

    addLabel(label: Label)

    removeLabel(label: Label)

    addConnection(connection: Connection)

    removeConnection(connection: Connection)
}
