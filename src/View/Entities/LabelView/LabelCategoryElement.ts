import {LabelCategory} from "../../../Store/LabelCategory";
import {Base} from "../../../Infrastructure/Repository";
import {View} from "../../View";
import {SVGNS} from "../../../Infrastructure/SVGNS";
import {Font} from "../../Font";
import {addAlpha} from "../../../Infrastructure/Color";

export namespace LabelCategoryElement {
    class Factory {
        private svgElement: SVGGElement;

        constructor(
            private store: LabelCategory.Entity,
            private readonly font: Font.ValueObject,
            private readonly padding: number,
            labelOpacity: number
        ) {
            this.svgElement = document.createElementNS(SVGNS, 'g') as SVGGElement;
            const rectElement = document.createElementNS(SVGNS, 'rect') as SVGRectElement;
            // todo: auto detect black/white font color
            rectElement.setAttribute('fill', /^#/g.test(store.color) ? addAlpha(store.color, labelOpacity) : store.color);
            rectElement.setAttribute('stroke', store.borderColor);
            rectElement.setAttribute('width', this.width.toString());
            rectElement.setAttribute('height', (font.lineHeight + padding * 2).toString());
            // todo: add an entry in labelCategory
            rectElement.setAttribute('rx', (padding * 2).toString());
            rectElement.style.cursor = "pointer";
            const textElement = document.createElementNS(SVGNS, 'text') as SVGTextElement;
            textElement.style.userSelect = "none";
            textElement.style.cursor = "pointer";
            textElement.textContent = store.text;
            textElement.setAttribute("dx", padding.toString());
            textElement.setAttribute("dy", `${font.topToBaseLine + padding}px`);
            this.svgElement.appendChild(rectElement);
            this.svgElement.appendChild(textElement);
        }

        get width() {
            return this.font.widthOf(this.store.text) + this.padding * 2;
        }

        public create(): SVGGElement {
            return this.svgElement.cloneNode(true) as SVGGElement;
        }

        get id() {
            return this.store.id;
        }
    }

    export class FactoryRepository extends Base.Repository<Factory> {
        constructor(root: View, config: {
            readonly labelPadding: number,
            readonly labelOpacity: number
        }) {
            super();
            for (let entity of root.store.labelCategoryRepo.values()) {
                this.add(new Factory(
                    entity,
                    root.labelFont,
                    config.labelPadding,
                    config.labelOpacity
                ));
            }
        }
    }
}
