import {SVGNS} from "../../../Infrastructure/SVGNS";
import {Font} from "./Font";

export class FontMeasureService {
    private readonly baseLineReferenceElement: SVGRectElement;
    private readonly measuringElement: SVGTSpanElement;

    constructor(
        private svgElement: SVGSVGElement,
        private textElement: SVGTextElement
    ) {
        this.baseLineReferenceElement = document.createElementNS(SVGNS, 'rect');
        this.baseLineReferenceElement.setAttribute('width', '1px');
        this.baseLineReferenceElement.setAttribute('height', '1px');
        this.svgElement.appendChild(this.baseLineReferenceElement);

        this.measuringElement = document.createElementNS(SVGNS, 'tspan') as SVGTSpanElement;
        this.textElement.appendChild(this.measuringElement);
    }

    public measure(classNames: Array<string>,
                   text: string): Font {
        this.measuringElement.classList.add(...classNames);
        const font = new Font(text, this.measuringElement, this.baseLineReferenceElement);
        this.measuringElement.classList.remove(...classNames);
        return font;
    };

    remove() {
        this.baseLineReferenceElement.remove();
        this.measuringElement.remove();
    }
}
