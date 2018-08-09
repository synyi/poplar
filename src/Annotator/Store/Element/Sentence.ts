import {TextSlice} from "../Base/TextSlice";
import {Paragraph} from "./Paragraph";

/**
 * 句
 * 指用"。"、"？"、"！"结尾的句子
 */
export class Sentence extends TextSlice {
    parent: Paragraph/*=null; in base*/;

    // constructor(parent,startIndexInParent,endIndexInParent,children) in base
}