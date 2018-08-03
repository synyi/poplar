import * as SVG from "svg.js";

export interface Renderable {
    svgElement: SVG.Element;

    render(context?: SVG.Element);
}