import {RenderBehaviour} from "./RenderBehaviour";
import {TextBlock} from "../../TextBlock";
import * as SVG from "svg.js";

export class OneShotRenderBehaviour implements RenderBehaviour {
    render(textBlocks: Array<TextBlock>, svgElement: SVG.Text) {
        svgElement.build(true);
        textBlocks.map(it => it.render(svgElement));
        svgElement.build(false);
    }
}