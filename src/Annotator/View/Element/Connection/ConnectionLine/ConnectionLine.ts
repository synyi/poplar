import {Renderable} from "../../../Interface/Renderable";
import {ConnectionText} from "../ConnectionText";
import {ConnectionView} from "../ConnectionView";
import * as SVG from "svg.js";
import {Destructable} from "../../../../Common/Base/Destructable";

export abstract class ConnectionLine extends Destructable implements Renderable {
    svgElement: SVG.Path = null;
    protected parent: ConnectionView = null;

    protected constructor(protected text: ConnectionText) {
        super();
        this.parent = this.text.parent;
        text.rendered$.subscribe(() => {
            this.render();
        });
    }


    abstract render(context?: SVG.Element)

    _destructor() {
        this.parent = null;
        if (this.svgElement !== null)
            this.svgElement.remove();
        this.svgElement = null;
    }
}