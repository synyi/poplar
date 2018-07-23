import {Label} from "./Label";

export interface DataSource {
    getRawContent(): string

    getLabels(): Array<Label>

    requireText(): Promise<string>
}
