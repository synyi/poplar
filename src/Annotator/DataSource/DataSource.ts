import {Label} from "../Store/Element/Label/Label";
import {Connection} from "../Store/Element/Connection/Connection";
import {LabelCategory} from "../Store/Element/Label/LabelCategory";
import {ConnectionCategory} from "../Store/Element/Connection/ConnectionCategory";

export interface DataSource {
    getRawContent(): string

    getLabels(): Array<Label>

    getConnections(): Array<Connection>

    addLabel(label: Label)

    addConnection(connection: Connection)

    requireLabelCategory(): Promise<LabelCategory>

    requireConnectionCategory(): Promise<ConnectionCategory>
}
