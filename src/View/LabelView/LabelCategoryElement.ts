import {LabelCategory} from "../../Store/Entities/LabelCategory";
import {Base} from "../../Infrastructure/Repository";
import {View} from "../View";
import {svgNS} from "../../Infrastructure/svgNS";
import {Font} from "../Font";
import {fromNullable} from "../../Infrastructure/option";
import {addAlpha} from "../../Infrastructure/color";

export namespace LabelCategoryElement {
    class Factory {
        private svgElement: SVGGElement;

        constructor(
            private store: LabelCategory.Entity,
            font: Font,
            padding: number,
            classes: Array<string>
        ) {
            this.svgElement = document.createElementNS(svgNS, 'g') as SVGGElement;
            const rectElement = document.createElementNS(svgNS, 'rect') as SVGRectElement;
            rectElement.setAttribute('fill', addAlpha(store.color, 90));
            rectElement.setAttribute('stroke', store.borderColor);
            rectElement.setAttribute('width', (font.widthOf(store.text) + padding * 2).toString());
            rectElement.setAttribute('height', (font.lineHeight + padding * 2).toString());
            // todo: add an entry in labelCategory
            rectElement.setAttribute('rx', (padding * 2).toString());
            const textElement = document.createElementNS(svgNS, 'text') as SVGTextElement;
            textElement.classList.add('poplar-label', ...classes);
            textElement.innerHTML = store.text;
            textElement.setAttribute("dx", padding.toString());
            textElement.setAttribute("dy", `${font.topToBaseLine + padding}px`);
            // todo: auto detect black/white font color
            // todo: add an entry in labelCategory
            this.svgElement.appendChild(rectElement);
            this.svgElement.appendChild(textElement);
        }

        public create(): SVGGElement {
            return this.svgElement.cloneNode(true) as SVGGElement;
        }
    }

    export class FactoryRepository extends Base.Repository<Factory> {
        constructor(root: View) {
            super(root);
            for (let entity of root.store.labelCategoryRepo.values()) {
                this.add(new Factory(
                    entity,
                    root.labelFont,
                    root.config.labelPadding || 2,
                    fromNullable(root.config.labelClasses).orElse([])
                ));
            }
        }
    }
}
