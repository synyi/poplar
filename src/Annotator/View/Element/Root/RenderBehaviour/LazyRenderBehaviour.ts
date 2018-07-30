import {RenderBehaviour} from "./RenderBehaviour";
import {TextBlock} from "../../TextBlock";
import * as SVG from "svg.js";

let PAGE_SIZE = 10;
let RENDER_INTERVAL = 1000;

export class LazyRenderBehaviour implements RenderBehaviour {
    private nextRenderIndex = 0;
    private shrinkPageSizeCount = 0;

    render(textBlocks: Array<TextBlock>, svgElement: SVG.Text) {
        this.renderOnce(textBlocks, svgElement);
    }

    renderOnce(textBlocks: Array<TextBlock>, svgElement: SVG.Text) {
        let startTime = (new Date()).getTime();
        svgElement.build(true);
        let nextRenderContents = textBlocks.slice(this.nextRenderIndex, this.nextRenderIndex + PAGE_SIZE);
        nextRenderContents.map(it => it.render(svgElement));
        this.nextRenderIndex += nextRenderContents.length;
        let endTime = (new Date()).getTime();
        if (PAGE_SIZE > 1 && endTime - startTime > RENDER_INTERVAL / 2) {
            --PAGE_SIZE;
            if (PAGE_SIZE > 1 && endTime - startTime > RENDER_INTERVAL) {
                PAGE_SIZE = Math.ceil(PAGE_SIZE / 2);
            }
            ++this.shrinkPageSizeCount;
            if (this.shrinkPageSizeCount > 5) {
                RENDER_INTERVAL += 100;
                this.shrinkPageSizeCount = 0;
            }
        } else {
            ++PAGE_SIZE;
        }
        (svgElement.doc() as any).resize();
        if (this.nextRenderIndex < textBlocks.length) {
            setTimeout(() => {
                this.renderOnce(textBlocks, svgElement);
            }, RENDER_INTERVAL);
        }
    }
}