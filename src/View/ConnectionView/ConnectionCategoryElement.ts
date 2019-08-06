import {Base} from "../../Infrastructure/Repository";
import {View} from "../View";
import {svgNS} from "../../Infrastructure/svgNS";
import {Font} from "../Font";
import {fromNullable} from "../../Infrastructure/option";
import {ConnectionCategory} from "../../Store/Entities/ConnectionCategory";

export namespace ConnectionCategoryElement {
    class Factory {
        private svgElement: SVGGElement;

        constructor(
            private store: ConnectionCategory.Entity,
            font: Font,
            classes: Array<string>
        ) {
            this.svgElement = document.createElementNS(svgNS, 'g') as SVGGElement;
            const rectElement = document.createElementNS(svgNS, 'rect') as SVGRectElement;
            // todo: detect background color
            rectElement.setAttribute('fill', '#ffffff');
            rectElement.setAttribute('width', (font.widthOf(store.text)).toString());
            rectElement.setAttribute('height', (font.lineHeight).toString());
            // todo: add an entry in labelCategory
            const textElement = document.createElementNS(svgNS, 'text') as SVGTextElement;
            textElement.classList.add('poplar-connection', ...classes);
            textElement.innerHTML = store.text;
            textElement.setAttribute("dy", `${font.topToBaseLine}px`);
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
            for (let entity of root.store.connectionCategoryRepo.values()) {
                this.add(new Factory(
                    entity,
                    root.connectionFont,
                    fromNullable(root.config.connectionClasses).orElse([])
                ));
            }
        }
    }
}
