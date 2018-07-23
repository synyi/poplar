import {Label} from "./Label";

export interface DataSource {
    getRawContent(): string

    getLabels(): Array<Label>

    addLabel(label: Label)

    requireText(): Promise<string>
}
