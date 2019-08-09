import {Store} from "../Store/Store";
import {SVGNS} from "../Infrastructure/SVGNS";
import {Line} from "./Entities/Line/Line";
import {Font} from "./Font";
import {RepositoryRoot} from "../Infrastructure/Repository";
import {LabelCategoryElement} from "./Entities/LabelView/LabelCategoryElement";
import {LabelView} from "./Entities/LabelView/LabelView";
import {ConnectionView} from "./Entities/ConnectionView/ConnectionView";
import {ConnectionCategoryElement} from "./Entities/ConnectionView/ConnectionCategoryElement";
import {Annotator} from "../Annotator";
import {Label} from "../Store/Entities/Label";

export interface Config {
    readonly contentClasses: Array<string>;
    readonly labelClasses: Array<string>;
    readonly connectionClasses: Array<string>;
    // svg barely support anything!
    // we don't have lineHeight, padding, border-box, etc
    // bad for it
    // maybe let the user write the css
    // and we read it via getComputedStyle?
    // ^ sorry, firefox don't like this idea
    readonly labelPadding: number;
    readonly lineHeight: number;
    readonly topContextMargin: number;
    readonly bracketWidth: number;
    readonly connectionWidthCalcMethod: "text" | "line";
    // todo: merge this into store.labelCategory.color
    readonly labelOpacity: number;
}

export class View implements RepositoryRoot {
    readonly contentFont: Font;
    readonly labelFont: Font;
    readonly connectionFont: Font;

    readonly topContextLayerHeight: number;
    readonly textElement: SVGTextElement;
    readonly lines: Array<Line.Entity>;

    readonly labelCategoryElementFactoryRepository: LabelCategoryElement.FactoryRepository;
    readonly connectionCategoryElementFactoryRepository: ConnectionCategoryElement.FactoryRepository;
    readonly labelViewRepository: LabelView.Repository;
    readonly connectionViewRepository: ConnectionView.Repository;

    readonly markerElement: SVGMarkerElement;
    readonly store: Store;

    constructor(
        readonly root: Annotator,
        readonly svgElement: SVGSVGElement,
        readonly config: Config
    ) {
        this.store = root.store;
        this.labelViewRepository = new LabelView.Repository(this);
        this.connectionViewRepository = new ConnectionView.Repository(this);

        this.markerElement = View.createMarkerElement();
        this.svgElement.appendChild(this.markerElement);

        this.textElement = document.createElementNS(SVGNS, 'text') as SVGTextElement;
        const baseLineReferenceElement = document.createElementNS(SVGNS, 'rect');
        baseLineReferenceElement.setAttribute('width', '1px');
        baseLineReferenceElement.setAttribute('height', '1px');
        this.svgElement.appendChild(baseLineReferenceElement);
        this.svgElement.appendChild(this.textElement);
        const testRender = (onElement: SVGTSpanElement,
                            classNames: Array<string>,
                            text: string): Font => {
            onElement.classList.add(...classNames);
            this.textElement.appendChild(onElement);
            const font = new Font(text, onElement, baseLineReferenceElement);
            this.textElement.removeChild(onElement);
            onElement.classList.remove(...classNames);
            return font;
        };
        const measuringElement = document.createElementNS(SVGNS, 'tspan') as SVGTSpanElement;

        this.contentFont = testRender(measuringElement, config.contentClasses, this.store.content);

        const labelText = Array.from(this.store.labelCategoryRepo.values()).map(it => it.text).join('');
        this.labelFont = testRender(measuringElement, config.labelClasses, labelText);

        const connectionText = Array.from(this.store.connectionCategoryRepo.values()).map(it => it.text).join('');
        this.connectionFont = testRender(measuringElement, config.labelClasses, connectionText);

        const labelElementHeight = this.labelFont.lineHeight + 2 /*stroke*/ + 2 * config.labelPadding + config.bracketWidth;
        this.topContextLayerHeight = config.topContextMargin * 2 +
            Math.max(labelElementHeight, this.connectionFont.lineHeight);
        baseLineReferenceElement.remove();
        this.textElement.classList.add(...config.contentClasses);

        this.labelCategoryElementFactoryRepository = new LabelCategoryElement.FactoryRepository(this, config);
        this.connectionCategoryElementFactoryRepository = new ConnectionCategoryElement.FactoryRepository(this, config);

        this.lines = Line.constructAll(this, this.contentFont, svgElement.width.baseVal.value);

        const constructLabels = () => {
            for (let line of this.lines) {
                const labels = this.store.labelRepo.getEntitiesInRange(line.startIndex, line.endIndex);
                const labelViews = labels.map(it => new LabelView.Entity(it, line.topContext, config));
                labelViews.map(it => this.labelViewRepository.add(it));
                labelViews.map(it => line.topContext.addChild(it));
            }
        };

        const constructConnections = () => {
            for (let line of this.lines) {
                const labels = this.store.labelRepo.getEntitiesInRange(line.startIndex, line.endIndex);
                labels.map(label => {
                    const connections = label.sameLineConnections.filter(it => !this.connectionViewRepository.has(it.id));
                    const connectionViews = connections.map(it => new ConnectionView.Entity(it, line.topContext, this.config));
                    connectionViews.map(it => this.connectionViewRepository.add(it));
                    connectionViews.map(it => line.topContext.addChild(it));
                });
            }
        };

        constructLabels();
        constructConnections();
        const tspans = this.lines.map(it => it.render());
        this.textElement.append(...tspans);
        this.svgElement.style.height = this.height.toString() + 'px';
        this.textElement.onmouseup = () => {
            if (window.getSelection().type === "Range") {
                this.root.textSelectionHandler.textSelected();
            }
        };
        this.registerEventHandlers();
    }

    get height() {
        return this.lines.reduce((currentValue, line) => currentValue + line.height + this.contentFont.fontSize * (this.config.lineHeight - 1), 20);
    }

    static createMarkerElement(): SVGMarkerElement {
        const markerArrow = document.createElementNS(SVGNS, 'path');
        markerArrow.setAttribute('d', "M0,4 L0,8 L6,6 L0,4 L0,8");
        markerArrow.setAttribute("stroke", "#000000");
        markerArrow.setAttribute("fill", "#000000");
        const markerElement = document.createElementNS(SVGNS, 'marker');
        markerElement.setAttribute('id', 'marker-arrow');
        markerElement.setAttribute('markerWidth', '8');
        markerElement.setAttribute('markerHeight', '10');
        markerElement.setAttribute('orient', 'auto');
        markerElement.setAttribute('refX', '5');
        markerElement.setAttribute('refY', '6');
        markerElement.appendChild(markerArrow);
        return markerElement;
    };

    private registerEventHandlers() {
        this.store.labelRepo.on('created', (label: Label.Entity) => {
            let startLineIndex: number = null;
            let endLineIndex: number = null;
            this.lines.forEach((line: Line.Entity, index: number) => {
                if (line.startIndex <= label.startIndex && label.startIndex < line.endIndex) {
                    startLineIndex = index;
                }
                if (line.startIndex <= label.endIndex - 1 && label.endIndex - 1 < line.endIndex) {
                    endLineIndex = index + 1;
                }
            });
            // in one line
            if (endLineIndex === startLineIndex + 1) {
                const line = this.lines[startLineIndex];
                const labelView = new LabelView.Entity(label, line.topContext, this.config);
                this.labelViewRepository.add(labelView);
                line.topContext.addChild(labelView);
                line.topContext.renderChild(labelView);
                line.topContext.update();
                line.update();
                let currentLine = line.next;
                while (currentLine.isSome) {
                    currentLine.map(it => it.topContext.update());
                    currentLine = currentLine.toNullable().next;
                }
                this.svgElement.style.height = this.height.toString() + 'px';
            }
        });
        this.store.labelRepo.on('update ', (label: Label.Entity) => {

        });
        this.store.labelRepo.on('deleted', (label: Label.Entity) => {

        });
    }
}
