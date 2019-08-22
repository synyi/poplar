import {Option} from "../../../Infrastructure/Option";
import {SVGNS} from "../../../Infrastructure/SVGNS";
import {View} from "../../View";
import {TopContext} from "./TopContext/TopContext";
import {takeWhile} from "../../../Infrastructure/Array";

export namespace Line {
    export interface Config {
        readonly lineHeight: number
    }

    export class ValueObject {
        readonly topContext: TopContext;
        public svgElement: SVGTSpanElement;
        private readonly config: Config;

        constructor(
            startIndex: number,
            endIndex: number,
            public last: Option<ValueObject>,
            public next: Option<ValueObject>,
            readonly view: View
        ) {
            this._startIndex = startIndex;
            this._endIndex = endIndex;
            this.topContext = new TopContext(this);
            this.config = view.config;
        }

        private _startIndex: number;

        get startIndex(): number {
            return this._startIndex;
        }

        private _endIndex: number;

        get endIndex(): number {
            return this._endIndex;
        }

        move(offset: number) {
            this._startIndex += offset;
            this._endIndex += offset;
        }

        inserted(characterCount: number) {
            this._endIndex += characterCount;
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
            return takeWhile(this.view.lines, (other: Line.ValueObject) => other !== this)
                    .reduce((currentValue, line) => currentValue + line.height + this.view.contentFont.fontSize * (this.config.lineHeight - 1), 0)
                + this.topContext.layer * this.view.topContextLayerHeight;
        }

        get isBlank(): boolean {
            return this.view.store.content.slice(this.startIndex, this.endIndex - 1) === "";
        }

        get content(): string {
            if (this.endWithHardLineBreak) {
                if (this.isBlank) {
                    return "⮐";
                }
                return this.view.store.content.slice(this.startIndex, this.endIndex - 1);
            } else {
                return this.view.store.content.slice(this.startIndex, this.endIndex);
            }
        }

        get endWithHardLineBreak(): boolean {
            return this.view.store.content[this.endIndex - 1] === '\n';
        }

        update() {
            this.svgElement.innerHTML = this.content.replace(/ /g, "&nbsp;");
            if (this.isBlank) {
                this.svgElement.style.fontSize = `${this.view.contentFont.fontSize / 4}px`;
            } else {
                this.svgElement.style.fontSize = `${this.view.contentFont.fontSize}px`;
            }
            // todo: 15 is a magic number, should be calculated from
            // (max(LabelCategoryView.width) - min(ContentFont.width)) / 2
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

        insertBefore(other: Line.ValueObject) {
            this.render();
            other.svgElement.parentNode.insertBefore(this.svgElement, other.svgElement);
            other.topContext.svgElement.parentNode.insertBefore(this.topContext.svgElement, other.topContext.svgElement);
            other.topContext.backgroundElement.parentNode.insertBefore(this.topContext.backgroundElement, other.topContext.backgroundElement);
        }

        insertAfter(other: Line.ValueObject) {
            this.render();
            other.svgElement.insertAdjacentElement("afterend", this.svgElement);
            other.topContext.svgElement.insertAdjacentElement("afterend", this.topContext.svgElement);
            other.topContext.backgroundElement.insertAdjacentElement("afterend", this.topContext.backgroundElement);
        }
    }
}
