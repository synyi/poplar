import {Store} from "../Store/Store";
import {svgNS} from "../Infrastructure/svgNS";
import {Line} from "./Line/Line";
import {fromNullable} from "../Infrastructure/option";
import {Font} from "./Font";
import {RepositoryRoot} from "../Infrastructure/Repository";
import {LabelCategoryElement} from "./LabelView/LabelCategoryElement";
import {LabelView} from "./LabelView/LabelView";
import {ConnectionView} from "./ConnectionView/ConnectionView";
import {ConnectionCategoryElement} from "./ConnectionView/ConnectionCategoryElement";

export interface ViewConfig {
    contentClasses?: Array<string>;
    labelClasses?: Array<string>;
    connectionClasses?: Array<string>;
    // svg barely support anything!
    // bad for it
    // maybe let the user write the css
    // and we read it via getComputedStyle?
    labelPadding?: number;
    lineHeight?: number;
}

export class View implements RepositoryRoot {
    readonly contentFont: Font;
    readonly labelFont: Font;
    readonly connectionFont: Font;
    readonly topContextLayerHeight: number;
    readonly textElement: SVGTextElement;
    readonly lines: Array<Line.Entity> = [];
    readonly labelCategoryElementFactoryRepository: LabelCategoryElement.FactoryRepository;
    readonly connectionCategoryElementFactoryRepository: ConnectionCategoryElement.FactoryRepository;
    readonly labelViewRepository: LabelView.Repository;
    readonly connectionViewRepository: ConnectionView.Repository;
    readonly markerElement: SVGMarkerElement;

    constructor(
        readonly store: Store,
        readonly svgElement: SVGSVGElement,
        readonly config: ViewConfig
    ) {
        this.labelViewRepository = new LabelView.Repository(this);
        this.connectionViewRepository = new ConnectionView.Repository(this);
        const markerArrow = document.createElementNS(svgNS, 'path');
        markerArrow.setAttribute('d', "M0,4 L0,8 L6,6 L0,4 L0,8");
        markerArrow.setAttribute("stroke", "#000000");
        markerArrow.setAttribute("fill", "#000000");
        this.markerElement = document.createElementNS(svgNS, 'marker');
        this.markerElement.setAttribute('id', 'marker-arrow');
        this.markerElement.setAttribute('markerWidth', '8');
        this.markerElement.setAttribute('markerHeight', '10');
        this.markerElement.setAttribute('orient', 'auto');
        this.markerElement.setAttribute('refX', '5');
        this.markerElement.setAttribute('refY', '6');
        this.markerElement.appendChild(markerArrow);
        this.svgElement.appendChild(this.markerElement);

        this.textElement = document.createElementNS(svgNS, 'text') as SVGTextElement;
        const baseLineReferenceElement = document.createElementNS(svgNS, 'rect');
        baseLineReferenceElement.setAttribute('width', '1px');
        baseLineReferenceElement.setAttribute('height', '1px');
        this.svgElement.appendChild(baseLineReferenceElement);
        this.svgElement.appendChild(this.textElement);
        const testRender = (onElement: SVGTSpanElement,
                            staticClassName: string,
                            dynamicClassNames: Array<string> | null,
                            text: string,
                            preserve: boolean = false): Font => {
            onElement.classList.add(staticClassName, ...fromNullable(dynamicClassNames).orElse([]));
            this.textElement.appendChild(onElement);
            const font = new Font(text, onElement, baseLineReferenceElement);
            if (!preserve) {
                this.textElement.removeChild(onElement);
                onElement.classList.remove(staticClassName, ...fromNullable(dynamicClassNames).orElse([]));
            }
            return font;
        };
        const measuringElement = document.createElementNS(svgNS, 'tspan') as SVGTSpanElement;
        this.contentFont = testRender(measuringElement, 'poplar-content', config.contentClasses, store.content, true);
        this.textElement.removeChild(measuringElement);
        measuringElement.classList.remove('poplar-content', ...fromNullable(config.contentClasses).orElse([]));


        const labelText = Array.from(store.labelCategoryRepo.values()).map(it => it.text).join('');
        this.labelFont = testRender(measuringElement, 'poplar-label', config.labelClasses, labelText);

        const connectionText = Array.from(store.connectionCategoryRepo.values()).map(it => it.text).join('');
        this.connectionFont = testRender(measuringElement, 'poplar-connection', config.labelClasses, connectionText);

        this.topContextLayerHeight = Math.max(this.labelFont.lineHeight + 2 /*stroke*/ + 6 /*padding*/ + 6 /*margin*/ + 8 /*bracket*/, this.connectionFont.lineHeight + 6/*margin*/);
        baseLineReferenceElement.remove();
        this.textElement.classList.add('poplar-content', ...fromNullable(config.contentClasses).orElse([]));

        this.labelCategoryElementFactoryRepository = new LabelCategoryElement.FactoryRepository(this);
        this.connectionCategoryElementFactoryRepository = new ConnectionCategoryElement.FactoryRepository(this);

        this.lines = Line.constructAll(this, this.contentFont, svgElement.width.baseVal.value);
        for (let line of this.lines) {
            const labels = this.store.labelRepo.getEntitiesInRange(line.startIndex, line.endIndex);
            const labelViews = labels.map(it => new LabelView.Entity(it, line.topContext));
            labelViews.map(it => this.labelViewRepository.add(it));
            labelViews.map(it => line.topContext.addChildren(it));
        }
        for (let line of this.lines) {
            const labels = this.store.labelRepo.getEntitiesInRange(line.startIndex, line.endIndex);
            labels.map(label => {
                const connections = label.sameLineConnections.filter(it => !this.connectionViewRepository.has(it.id));
                const connectionViews = connections.map(it => new ConnectionView.Entity(it, line.topContext));
                connectionViews.map(it => this.connectionViewRepository.add(it));
                connectionViews.map(it => line.topContext.addChildren(it));
            });
        }
        const tspans = this.lines.map(it => it.render());
        this.textElement.append(...tspans);
        this.svgElement.style.height = this.lines.reduce((currentValue, line) => currentValue + line.height + this.contentFont.fontSize * 0.5, 20).toString() + 'px';
    }
}
