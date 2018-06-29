import {Sentence} from "./Sentence";

export class Label {
    constructor(private sentenceBelongTo: Sentence,
                private startIndex: number,
                private endIndex: number) {
    }
}
