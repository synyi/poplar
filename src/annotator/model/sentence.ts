import {Label} from "./label";

export class Sentence {
    private content: string;
    private labels: Array<Label>;

    public onCreateLabel(word: Label) {
        this.labels.push(word);
    }

    public slice(startIndex: number, endIndex: number) {
        return this.content.slice(startIndex, endIndex)
    }
}