import {LabelAttachedTextSlice} from "./Base/LabelAttachedTextSlice";
import {Paragraph} from "./Paragraph";

export class Sentence extends LabelAttachedTextSlice {
    parent: Paragraph;
}