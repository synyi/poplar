import {Controller} from "../controller/controller";
import {Sentence} from "./sentence"

export class Paragraph {
    private sentences: Array<Sentence>;

    constructor(
        content: string,
        private controller: Controller
    ) {
        // todo: parse content to generate Sentences
        // consider use web worker
    }

}