import {Label} from "../Label";
import {Paragraph} from "../Paragraph";
import {Sentence} from "../Sentence";
import {EventBus} from "../../Tools/EventBus";

export class LabelAdded {
    static eventName = 'LabelAdded';

    constructor(
        public label: Label,
        public removedParagraphs: Array<Paragraph> = null,
        public paragraphIn: Paragraph = null,
        public removedSentences: Array<Sentence> = null,
        public sentenceIn: Sentence = null
    ) {
    }

    emit() {
        EventBus.emit(LabelAdded.eventName, this);
    }
}