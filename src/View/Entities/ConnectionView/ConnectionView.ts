import {TopContextUser} from "../Line/TopContext/TopContextUser";
import {TopContext} from "../Line/TopContext/TopContext";
import {Line} from "../Line/Line";
import {View} from "../../View";
import {SVGNS} from "../../../Infrastructure/SVGNS";
import {Base} from "../../../Infrastructure/Repository";
import {LabelView} from "../LabelView/LabelView";
import {Connection} from "../../../Store/Connection";

export namespace ConnectionView {
    export interface Config {
        readonly connectionWidthCalcMethod: "text" | "line",
        readonly connectionClasses: Array<string>;
    }

    export class Entity extends TopContextUser {
        private svgElement: SVGGElement;
        private lineElement: SVGPathElement;

        constructor(private store: Connection.Entity,
                    private contextIn: TopContext,
                    private config: Config) {
            super();
        }

        get id() {
            return this.store.id;
        }

        get lineIn(): Line.ValueObject {
            return this.contextIn.belongTo;
        }

        get view(): View {
            return this.lineIn.view;
        }

        get sameLineLabelView(): LabelView.Entity {
            return this.view.labelViewRepository.get(this.store.priorLabel.id);
        }

        get mayNotSameLineLabelView(): LabelView.Entity {
            return this.view.labelViewRepository.get(this.store.posteriorLabel.id);
        }

        get fromLabelView(): LabelView.Entity {
            return this.view.labelViewRepository.get(this.store.from.id);
        }

        get toLabelView(): LabelView.Entity {
            return this.view.labelViewRepository.get(this.store.to.id);
        }

        get leftLabelView(): LabelView.Entity {
            return this.fromLabelView.labelLeft < this.toLabelView.labelLeft ? this.fromLabelView : this.toLabelView;
        }

        get rightLabelView(): LabelView.Entity {
            return this.fromLabelView.labelLeft >= this.toLabelView.labelLeft ? this.fromLabelView : this.toLabelView;
        }

        get middle(): number {
            return (this.leftLabelView.labelLeft + this.rightLabelView.labelRight) / 2;
        }

        get textWidth(): number {
            return this.view.connectionFont.widthOf(this.store.category.text);
        }

        get textLeft(): number {
            return this.middle - this.textWidth / 2;
        }

        get lineIncludedWidth(): number {
            if (this.fromLabelView.labelLeft < this.toLabelView.labelLeft) {
                return this.toLabelView.labelRight - this.fromLabelView.labelLeft;
            } else {
                return this.fromLabelView.labelRight - this.toLabelView.labelLeft;
            }
        }

        get lineIncludedLeft(): number {
            return this.fromLabelView.labelLeft < this.toLabelView.labelLeft ? this.fromLabelView.labelLeft : this.toLabelView.labelLeft;
        }

        get width(): number {
            return this.config.connectionWidthCalcMethod === "text" ? this.textWidth : this.lineIncludedWidth;
        }

        get left(): number {
            return this.config.connectionWidthCalcMethod === "text" ? this.textLeft : this.lineIncludedLeft;
        }

        get globalY(): number {
            return this.lineIn.y - this.layer * this.view.topContextLayerHeight;
        }

        render(): SVGGElement {
            this.svgElement = document.createElementNS(SVGNS, 'g') as SVGGElement;
            const textElement = this.view.connectionCategoryElementFactoryRepository.get(this.store.category.id).create();
            this.svgElement.appendChild(textElement);
            this.svgElement.style.cursor = "pointer";
            this.svgElement.onclick = (event: MouseEvent) => {
                this.view.root.emit('connectionClicked', this.id, event);
            };
            this.svgElement.ondblclick = (event: MouseEvent) => {
                this.view.root.emit('connectionDoubleClicked', this.id, event);
            };
            // todo: lineElement's right click event (configureable)
            this.svgElement.oncontextmenu = (event: MouseEvent) => {
                this.view.root.emit('connectionRightClicked', this.id, event);
                event.preventDefault();
            };
            // todo: lineElement's hover event (configureable)
            this.svgElement.onmouseenter = () => {
                this.svgElement.classList.add("hover");
                this.lineElement.classList.add("hover");
            };
            this.svgElement.onmouseleave = () => {
                this.svgElement.classList.remove("hover");
                this.lineElement.classList.remove("hover");
            };
            this.renderLine();
            return this.svgElement;
        }

        update() {
            this.svgElement.style.transform = `translate(${this.textLeft}px,${this.globalY}px)`;
            this.updateLine();
        }

        public addHover(label: "from" | "to") {
            this.svgElement.classList.add("hover-" + label);
            this.lineElement.classList.add("hover-" + label);
        }

        private updateLine() {
            const thisY = this.globalY + this.view.topContextLayerHeight / 2 - this.view.labelFont.fontSize + 2;
            if (this.fromLabelView.labelLeft < this.toLabelView.labelLeft) {
                this.lineElement.setAttribute('d', `
                    M ${this.fromLabelView.labelLeft + 1}   ${this.fromLabelView.globalY + 1}
                    C ${this.fromLabelView.labelLeft - 8}  ${thisY},
                      ${this.fromLabelView.labelLeft - 8}  ${thisY},
                      ${this.fromLabelView.labelLeft + 1}   ${thisY}
                    L ${this.toLabelView.labelLeft + this.toLabelView.labelWidth} ${thisY}
                    C ${this.toLabelView.labelLeft + this.toLabelView.labelWidth + 8}  ${thisY},
                      ${this.toLabelView.labelLeft + this.toLabelView.labelWidth + 8}  ${thisY},
                      ${this.toLabelView.labelLeft + this.toLabelView.labelWidth}   ${this.toLabelView.globalY - 1}
                `);
            } else {
                this.lineElement.setAttribute('d', `
                    M ${this.fromLabelView.labelRight - 1}   ${this.fromLabelView.globalY + 1}
                    C ${this.fromLabelView.labelRight + 8}  ${thisY},
                      ${this.fromLabelView.labelRight + 8}  ${thisY},
                      ${this.fromLabelView.labelRight - 1}   ${thisY}
                    L ${this.toLabelView.labelLeft}          ${thisY}
                    C ${this.toLabelView.labelLeft - 8}  ${thisY},
                      ${this.toLabelView.labelLeft - 8}  ${thisY},
                      ${this.toLabelView.labelLeft}   ${this.toLabelView.globalY - 1}
                `);
            }
        }

        public removeHover(label: "from" | "to") {
            this.svgElement.classList.remove("hover-" + label);
            this.lineElement.classList.remove("hover-" + label);
        }

        private renderLine() {
            this.lineElement = document.createElementNS(SVGNS, 'path');
            this.lineElement.classList.add(...this.config.connectionClasses.map(it => it + '-line'));
            this.lineElement.setAttribute("stroke", '#000000');
            this.lineElement.setAttribute("fill", 'none');
            this.lineElement.style.markerEnd = "url(#marker-arrow)";
            this.updateLine();
            this.contextIn.backgroundElement.appendChild(this.lineElement);
        }

        remove() {
            this.svgElement.remove();
            this.lineElement.remove();
        }
    }

    export class Repository extends Base.Repository<Entity> {

    }
}
