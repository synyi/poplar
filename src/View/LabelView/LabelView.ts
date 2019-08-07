import {Label} from "../../Store/Entities/Label";
import {TopContextUser} from "../Line/TopContext/TopContextUser";
import {SVGNS} from "../../Infrastructure/SVGNS";
import {TopContext} from "../Line/TopContext/TopContext";
import {View} from "../View";
import {Line} from "../Line/Line";
import {Option, some} from "../../Infrastructure/Option";
import {Base} from "../../Infrastructure/Repository";
import {addAlpha} from "../../Infrastructure/Color";

export namespace LabelView {
    export class Entity extends TopContextUser {
        layer: number = 0;
        private svgElement: Option<SVGGElement>;

        constructor(
            private store: Label.Entity,
            private contextIn: TopContext,
            private config: { readonly labelPadding: number, readonly bracketWidth: number }) {
            super();
        }

        get rendered(): boolean {
            return this.svgElement.isSome;
        }

        get id(): number {
            return this.store.id;
        }

        get lineIn(): Line.Entity {
            return this.contextIn.belongTo;
        }

        get view(): View {
            return this.lineIn.view;
        }

        get highLightWidth(): number {
            return this.view.contentFont.widthOf(this.view.store.contentSlice(this.store.startIndex, this.store.endIndex));
        }

        get highLightLeft() {
            return this.view.contentFont.widthOf(this.view.store.contentSlice(this.lineIn.startIndex, this.store.startIndex))
                + /*text element's margin*/15;
        }

        get highLightRight() {
            return this.highLightLeft + this.highLightWidth;
        }

        get middle() {
            return (this.highLightLeft + this.highLightRight) / 2;
        }

        get left() {
            return this.middle - this.width / 2;
        }

        get right() {
            return this.middle + this.width / 2;
        }

        get width() {
            return this.view.labelFont.widthOf(this.store.category.text) + this.config.labelPadding + 2;
        }

        get annotationY() {
            return -this.view.topContextLayerHeight * (this.layer - 1) - (this.view.labelFont.lineHeight + 2 + 2 * this.config.labelPadding + this.config.bracketWidth);
        }

        get globalY() {
            return this.lineIn.y + this.annotationY;
        }

        render(): SVGGElement {
            this.svgElement = some(document.createElementNS(SVGNS, 'g') as SVGGElement);
            const highLightElement = this.createHighLightElement();
            const annotationElement = this.createAnnotationElement();
            const y = this.view.topContextLayerHeight * (this.layer - 1);
            const bracketElement = this.createBracketElement(this.highLightWidth, -y, 0, -y, this.config.bracketWidth);

            this.svgElement.map(group => {
                group.appendChild(highLightElement);
                group.appendChild(annotationElement);
                group.appendChild(bracketElement);
            });
            return this.svgElement.toNullable();
        }

        private createAnnotationElement() {
            const annotationElement = this.view.labelCategoryElementFactoryRepository.get(this.store.category.id).create();
            const annotationElementY = this.annotationY;
            annotationElement.style.transform = `translate(${(this.highLightWidth - this.width) / 2}px,${annotationElementY}px)`;
            return annotationElement;
        }

        private createHighLightElement() {
            const highLightElement = document.createElementNS(SVGNS, 'rect') as SVGRectElement;
            highLightElement.setAttribute('height', this.lineIn.view.contentFont.lineHeight.toString());
            highLightElement.setAttribute('width', (this.highLightRight - this.highLightLeft).toString());
            highLightElement.setAttribute('fill', addAlpha(this.store.category.color, 70));
            return highLightElement;
        }

        update() {
            this.svgElement.map(group => {
                group.style.transform = `translate(${this.highLightLeft}px,${this.lineIn.y}px)`;
            });
        }

        /**
         * Thanks to Alex Hornbake (function for generate curly bracket path)
         * @see http://bl.ocks.org/alexhornbake/6005176
         */
        private createBracketElement(x1: number, y1: number, x2: number, y2: number, width: number, q: number = 0.6): SVGPathElement {
            //Calculate unit vector
            let dx = x1 - x2;
            let dy = y1 - y2;
            let len = Math.sqrt(dx * dx + dy * dy);
            dx = dx / len;
            dy = dy / len;

            //Calculate Control Points of path,
            let qx1 = x1 + q * width * dy;
            let qy1 = y1 - q * width * dx;
            let qx2 = (x1 - .25 * len * dx) + (1 - q) * width * dy;
            let qy2 = (y1 - .25 * len * dy) - (1 - q) * width * dx;
            let tx1 = (x1 - .5 * len * dx) + width * dy;
            let ty1 = (y1 - .5 * len * dy) - width * dx;
            let qx3 = x2 + q * width * dy;
            let qy3 = y2 - q * width * dx;
            let qx4 = (x1 - .75 * len * dx) + (1 - q) * width * dy;
            let qy4 = (y1 - .75 * len * dy) - (1 - q) * width * dx;
            const result = document.createElementNS(SVGNS, 'path');
            result.setAttribute('d', `M${x1},${y1}Q${qx1},${qy1},${qx2},${qy2}T${tx1},${ty1}M${x2},${y2}Q${qx3},${qy3},${qx4},${qy4}T${tx1},${ty1}`);
            result.setAttribute('fill', 'none');
            result.setAttribute('stroke', this.store.category.borderColor);
            return result;
        }

    }

    export class Repository extends Base.Repository<Entity> {
        get(key: number): LabelView.Entity | null {
            return this.entities.get(key);
        }
    }
}
