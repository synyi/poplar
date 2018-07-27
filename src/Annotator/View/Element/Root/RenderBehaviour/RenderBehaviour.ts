import {TextBlock} from "../../TextBlock";
import * as SVG from "svg.js";

export interface RenderBehaviour {
    render(textBlocks: Array<TextBlock>, svgElement: SVG.Text);
}
