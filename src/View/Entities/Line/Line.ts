import {Option} from "../../../Infrastructure/Option";
import {SVGNS} from "../../../Infrastructure/SVGNS";
import {View} from "../../View";
import {TopContext} from "./TopContext/TopContext";
import {takeWhile} from "../../../Infrastructure/Array";

export namespace Line {
    export class Entity {
        readonly topContext: TopContext;
        readonly startIndex: number;
        readonly endIndex: number;
        public svgElement: SVGTSpanElement;
        private readonly config: { readonly lineHeight: number };

        constructor(
            startIndex: number,
            endIndex: number,
            public last: Option<Entity>,
            public next: Option<Entity>,
            readonly view: View
        ) {
            this.startIndex = startIndex;
            this.endIndex = endIndex;
            this.topContext = new TopContext(this);
            this.config = view.config;
        }

        get dy(): number {
            return this.last.match(
                this.view.contentFont.fontSize * this.config.lineHeight,
                this.view.contentFont.topToBaseLine
            ) + this.topContext.layer * this.view.topContextLayerHeight;
        }

        get height(): number {
            return this.topContext.layer * this.view.topContextLayerHeight + this.view.contentFont.fontSize;
        }

        get y(): number {
            return takeWhile(this.view.lines, (other: Line.Entity) => other !== this)
                    .reduce((currentValue, line) => currentValue + line.height + this.view.contentFont.fontSize * (this.config.lineHeight - 1), 0)
                + this.topContext.layer * this.view.topContextLayerHeight;
        }

        get content(): string {
            if (this.endWithHardLineBreak) {
                return this.view.store.content.slice(this.startIndex, this.endIndex - 1);
            } else {
                return this.view.store.content.slice(this.startIndex, this.endIndex);
            }
        }

        get endWithHardLineBreak(): boolean {
            return this.view.store.content[this.endIndex - 1] === '\n';
        }

        update() {
            this.svgElement.innerHTML = this.content;
            this.svgElement.setAttribute("x", '15');
            this.svgElement.setAttribute("dy", this.dy.toString() + 'px');
        }

        render(): SVGTSpanElement {
            this.svgElement = document.createElementNS(SVGNS, 'tspan') as SVGTSpanElement;
            const [topContextElement, backgroundElement] = this.topContext.render();
            this.view.svgElement.insertBefore(topContextElement, this.view.textElement);
            this.view.markerElement.insertAdjacentElement('afterend', backgroundElement);
            Object.assign(this.svgElement, {annotatorElement: this});
            this.update();
            return this.svgElement;
        }

        remove() {
            this.topContext.remove();
            this.svgElement.remove();
        }

        insertBefore(other: Line.Entity) {
            this.render();
            other.svgElement.parentNode.insertBefore(this.svgElement, other.svgElement);
            other.topContext.svgElement.parentNode.insertBefore(this.topContext.svgElement, other.topContext.svgElement);
            other.topContext.backgroundElement.parentNode.insertBefore(this.topContext.backgroundElement, other.topContext.backgroundElement);
        }

        insertAfter(other: Line.Entity) {
            this.render();
            other.svgElement.insertAdjacentElement("afterend", this.svgElement);
            other.topContext.svgElement.insertAdjacentElement("afterend", this.topContext.svgElement);
            other.topContext.backgroundElement.insertAdjacentElement("afterend", this.topContext.backgroundElement);
        }
    }
}
