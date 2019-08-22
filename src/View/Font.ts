//                                  top        ___________________
//        /\                                    |               |
//       /  \                                   |               |
//      /____\                             topToBaseLine        |
//     /      \     \   /                       |            fontSize
//    /        \     \ /          baseLine     _|_              |
//                    /                                         |
//                   /             bottom      _________________|_
//    |--width--|  |width|
//
import {SVGNS} from "../Infrastructure/SVGNS";

export namespace Font {
    export class ValueObject {
        // it's really sad that in svg 1.1, I cannot set <text> in svg's
        // line-height directly to 100%, which can make
        // fontSize === lineHeight forever
        // which makes lineHeight necessary
        // and <text> in svg is fixed to box-sizing: content-box;
        // when render with dy=0
        // <text>'s **baseline**'s y is 0
        // for making <text>'s topY=0
        // topToBaseLine distance is necessary
        constructor(readonly fontFamily: string,
                    readonly fontSize: number,
                    readonly fontWeight: string,
                    readonly lineHeight: number,
                    readonly topToBaseLine: number,
                    readonly width: Map<string, number>) {
        }

        widthOf(text: Array<string> | string): number {
            if (typeof text === "string") {
                return this.widthOf(Array.from(text));
            } else {
                return text.map(it => this.width.get(it))
                    .reduce((a: number, b: number) => a + b, 0)
            }
        }
    }

    export namespace Factory {
        export function create(
            characters: string,
            testRenderElement: SVGTSpanElement,
            baseLineReferenceElement: SVGRectElement
        ): ValueObject {
            const width = new Map();
            const characterSet = new Set(characters);
            characterSet.delete('\n');
            const characterArray = Array.from(characterSet);
            testRenderElement.innerHTML = characterArray.join('');
            testRenderElement.parentNode.parentNode.insertBefore(baseLineReferenceElement, testRenderElement.parentNode);
            characterArray.forEach((ch: string, index: number) => {
                width.set(ch, testRenderElement.getExtentOfChar(index).width);
            });
            const topToBaseLine = baseLineReferenceElement.getBoundingClientRect().top - testRenderElement.getBoundingClientRect().top;
            const fontSize = parseFloat(window.getComputedStyle(testRenderElement).fontSize);
            const fontFamily = window.getComputedStyle(testRenderElement).fontFamily;
            const fontWeight = window.getComputedStyle(testRenderElement).fontWeight;
            const lineHeight = testRenderElement.getBoundingClientRect().height;
            return new ValueObject(fontFamily, fontSize, fontWeight, lineHeight, topToBaseLine, width);
        }

        class BatchMeasurer {
            private readonly baseLineReferenceElement: SVGRectElement;
            private readonly measuringElement: SVGTSpanElement;
            private readonly result: Array<ValueObject>;

            constructor(
                private svgElement: SVGSVGElement,
                private textElement: SVGTextElement
            ) {
                this.baseLineReferenceElement = document.createElementNS(SVGNS, 'rect') as SVGRectElement;
                this.baseLineReferenceElement.setAttribute('width', '1px');
                this.baseLineReferenceElement.setAttribute('height', '1px');
                this.svgElement.appendChild(this.baseLineReferenceElement);

                this.measuringElement = document.createElementNS(SVGNS, 'tspan') as SVGTSpanElement;
                this.textElement.appendChild(this.measuringElement);
                this.result = [];
            }

            public thanCreate(classNames: Array<string>,
                              text: string): this {
                this.measuringElement.classList.add(...classNames);
                const font = create(text, this.measuringElement, this.baseLineReferenceElement);
                this.measuringElement.classList.remove(...classNames);
                this.result.push(font);
                return this;
            }

            endBatch(): Array<ValueObject> {
                this.baseLineReferenceElement.remove();
                this.measuringElement.remove();
                return this.result;
            }
        }

        export function startBatch(
            svgElement: SVGSVGElement,
            textElement: SVGTextElement,
        ): BatchMeasurer {
            return new BatchMeasurer(svgElement, textElement);
        }
    }

    export namespace Service {
        export function measureMore(font: ValueObject,
                                    text: string,
                                    classes: Array<string>,
                                    textElement: SVGTextElement
        ): ValueObject {
            const characterSet = new Set(text);
            characterSet.delete('\n');
            const characterArray = Array.from(characterSet)
                .filter(it => !font.width.has(it));
            if (characterArray.length > 0) {
                const testRenderElement = document.createElementNS(SVGNS, 'tspan');
                testRenderElement.classList.add(...classes);
                testRenderElement.innerHTML = characterArray.join('');
                textElement.appendChild(testRenderElement);
                characterArray.forEach((ch: string, index: number) => {
                    font.width.set(ch, testRenderElement.getExtentOfChar(index).width);
                });
                testRenderElement.remove();
            }
            return font;
        }
    }
}
