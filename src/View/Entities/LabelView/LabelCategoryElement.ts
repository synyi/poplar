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
            font: Font.ValueObject,
            padding: number,
            classes: Array<string>,
            labelOpacity: number
        ) {
            this.svgElement = document.createElementNS(SVGNS, 'g') as SVGGElement;
            const rectElement = document.createElementNS(SVGNS, 'rect') as SVGRectElement;
            // todo: auto detect black/white font color
            rectElement.setAttribute('fill', addAlpha(store.color, labelOpacity));
            rectElement.setAttribute('stroke', store.borderColor);
            rectElement.setAttribute('width', (font.widthOf(store.text) + padding * 2).toString());
            rectElement.setAttribute('height', (font.lineHeight + padding * 2).toString());
            // todo: add an entry in labelCategory
            rectElement.setAttribute('rx', (padding * 2).toString());
            const textElement = document.createElementNS(SVGNS, 'text') as SVGTextElement;
            textElement.classList.add(...classes);
            textElement.style.userSelect = "none";
            textElement.innerHTML = store.text;
            textElement.setAttribute("dx", padding.toString());
            textElement.setAttribute("dy", `${font.topToBaseLine + padding}px`);
            this.svgElement.appendChild(rectElement);
            this.svgElement.appendChild(textElement);
        }

        public create(): SVGGElement {
            return this.svgElement.cloneNode(true) as SVGGElement;
        }
    }

    export class FactoryRepository extends Base.Repository<Factory> {
        constructor(root: View, config: {
            readonly labelPadding: number,
            readonly labelClasses: Array<string>,
            readonly labelOpacity: number
        }) {
            super();
            for (let entity of root.store.labelCategoryRepo.values()) {
                this.add(new Factory(
                    entity,
                    root.labelFont,
                    config.labelPadding,
                    config.labelClasses,
                    config.labelOpacity
                ));
            }
        }
    }
}
