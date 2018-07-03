import {Label} from "../../Store/Label";
import {Connection} from "../../Store/Connection";
import {Sentence} from "../../Store/Sentence";
import {Paragraph} from "../../Store/Paragraph";
import {Store} from "../../Store/Store";

export interface AnnotationElementBase {
    correspondingStore: Label | Connection | Sentence | Paragraph | Store;
    svgElement: any;

    render(svgDoc: any)

    rerender()

    layout()
}