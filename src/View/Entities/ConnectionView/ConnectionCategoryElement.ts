/**
 * 某一 "种" connection 的文字部分是一样的
 * 只需预先构造，而后在使用时 cloneNode 即可
 */
import {ConnectionCategory} from "../../../Store/ConnectionCategory";
import {Font} from "../../Font";
import {SVGNS} from "../../../Infrastructure/SVGNS";
import {Base} from "../../../Infrastructure/Repository";
import {View} from "../../View";

export namespace ConnectionCategoryElement {
    class Factory {
        private svgElement: SVGGElement;

        constructor(
            private store: ConnectionCategory.Entity,
            font: Font.ValueObject,
            classes: Array<string>
        ) {
            this.svgElement = document.createElementNS(SVGNS, 'g') as SVGGElement;
            const rectElement = document.createElementNS(SVGNS, 'rect') as SVGRectElement;
            // todo: detect background color
            // todo: add an entry in labelCategory
            rectElement.setAttribute('fill', '#ffffff');
            rectElement.setAttribute('width', (font.widthOf(store.text)).toString());
            rectElement.setAttribute('height', (font.lineHeight).toString());
            const textElement = document.createElementNS(SVGNS, 'text') as SVGTextElement;
            textElement.classList.add(...classes);
            textElement.innerHTML = store.text;
            textElement.setAttribute("dy", `${font.topToBaseLine}px`);
            this.svgElement.appendChild(rectElement);
            this.svgElement.appendChild(textElement);
        }

        public create(): SVGGElement {
            return this.svgElement.cloneNode(true) as SVGGElement;
        }
    }

    export interface Config {
        readonly connectionClasses: Array<string>
    }

    export class FactoryRepository extends Base.Repository<Factory> {
        constructor(view: View, private config: Config) {
            super();
            for (let entity of view.store.connectionCategoryRepo.values()) {
                super.add(new Factory(
                    entity,
                    view.connectionFont,
                    config.connectionClasses
                ));
            }
        }
    }
}
