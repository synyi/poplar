import {TopContextUser} from "../Line/TopContext/TopContextUser";
import {Option, some} from "../../Infrastructure/option";
import {TopContext} from "../Line/TopContext/TopContext";
import {Line} from "../Line/Line";
import {View} from "../View";
import {svgNS} from "../../Infrastructure/svgNS";
import {Base} from "../../Infrastructure/Repository";
import {LabelView} from "../LabelView/LabelView";
import {Connection} from "../../Store/Entities/Connection";

export namespace ConnectionView {
    export class Entity extends TopContextUser {
        layer: number = 0;
        private svgElement: Option<SVGGElement>;
        private lineElement: SVGPathElement;

        constructor(private store: Connection.Entity,
                    private contextIn: TopContext) {
            super();
        }

        get lineIn(): Line.Entity {
            return this.contextIn.belongTo;
        }

        get view(): View {
            return this.lineIn.view;
        }

        get sameLineLabelView(): LabelView.Entity {
            return this.view.labelViewRepository.get(this.store.sameLineLabel.id);
        }

        get mayNotSameLineLabelView(): LabelView.Entity {
            return this.view.labelViewRepository.get(this.store.mayNotSameLineLabel.id);
        }

        get fromLabelView(): LabelView.Entity {
            return this.view.labelViewRepository.get(this.store.from.id);
        }

        get toLabelView(): LabelView.Entity {
            return this.view.labelViewRepository.get(this.store.to.id);
        }

        get leftLabelView(): LabelView.Entity {
            return this.fromLabelView.left < this.toLabelView.left ? this.fromLabelView : this.toLabelView;
        }

        get rightLabelView(): LabelView.Entity {
            return this.fromLabelView.left >= this.toLabelView.left ? this.fromLabelView : this.toLabelView;
        }

        get middle(): number {
            return (this.leftLabelView.left + this.rightLabelView.right) / 2;
        }

        get width(): number {
            return this.view.connectionFont.widthOf(this.store.category.text);
        }

        get left(): number {
            return this.middle - this.width / 2;
        }

        get globalY(): number {
            return this.lineIn.y - this.layer * this.view.topContextLayerHeight
        }

        render(): SVGGElement {
            this.svgElement = some(document.createElementNS(svgNS, 'g') as SVGGElement);
            const textElement = this.view.connectionCategoryElementFactoryRepository.get(this.store.category.id).create();
            const thisY = this.globalY + this.view.labelFont.fontSize / 2;
            this.lineElement = document.createElementNS(svgNS, 'path');
            this.lineElement.setAttribute("stroke", '#000000');
            this.lineElement.setAttribute("fill", 'none');
            this.lineElement.style.markerEnd = "url(#marker-arrow)";
            if (this.fromLabelView.left < this.toLabelView.left) {
                this.lineElement.setAttribute('d', `
                    M ${this.fromLabelView.left + 1}   ${this.fromLabelView.globalY + 1}
                    C ${this.fromLabelView.left - 10}  ${thisY},
                      ${this.fromLabelView.left - 10}  ${thisY},
                      ${this.fromLabelView.left + 1}   ${thisY}
                    L ${this.toLabelView.left + this.toLabelView.width} ${thisY}
                    C ${this.toLabelView.left + this.toLabelView.width + 10}  ${thisY},
                      ${this.toLabelView.left + this.toLabelView.width + 10}  ${thisY},
                      ${this.toLabelView.left + this.toLabelView.width}   ${this.toLabelView.globalY - 1}
                `);
            } else {
                this.lineElement.setAttribute('d', `
                    M ${this.fromLabelView.right - 1}   ${this.fromLabelView.globalY + 1}
                    C ${this.fromLabelView.right + 10}  ${thisY},
                      ${this.fromLabelView.right + 10}  ${thisY},
                      ${this.fromLabelView.right - 1}   ${thisY}
                    L ${this.toLabelView.left}          ${thisY}
                    C ${this.toLabelView.left - 10}  ${thisY},
                      ${this.toLabelView.left - 10}  ${thisY},
                      ${this.toLabelView.left}   ${this.toLabelView.globalY - 1}

                `);
            }
            this.svgElement.map(element => {
                element.appendChild(textElement);
            });
            this.contextIn.backgroundElement.appendChild(this.lineElement);
            return this.svgElement.toNullable();
        }

        update() {
            this.svgElement.map(group => {
                group.style.transform = `translate(${this.left}px,${this.globalY}px)`;
            });
        }

        renderLine() {

        }
    }

    export class Repository extends Base.Repository<Entity> {

    }
}
