import {Label} from "./Label";
import {Connection} from "./Connection";

export interface DataSource {
    getRawContent(): string

    getLabels(): Array<Label>

    getConnections(): Array<Connection>

    addLabel(label: Label)

    requireLabelText(): Promise<string>

    requireConnectionText(): Promise<string>
}
