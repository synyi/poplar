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
import {Connection} from "../Store/Entities/Connection";
import divideLines = Line.divideLines;

export interface Config {
    readonly contentClasses: Array<string>;
    readonly labelClasses: Array<string>;
    readonly connectionClasses: Array<string>;
    // svg barely support anything!
    // we don't have lineHeight, padding, border-box, etc
    // bad for it
    readonly labelPadding: number;
    readonly lineHeight: number;
    readonly topContextMargin: number;
    readonly bracketWidth: number;
    readonly connectionWidthCalcMethod: "text" | "line";
    readonly labelWidthCalcMethod: "max" | "label"
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
    readonly lineMaxWidth: number;

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

        this.lineMaxWidth = svgElement.width.baseVal.value - 30;
        this.lines = Line.constructAll(this);

        this.lines.map(this.constructLabelViewsForLine.bind(this));
        this.lines.map(this.constructConnectionsForLine.bind(this));
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

    private constructLabelViewsForLine(line: Line.Entity): Array<LabelView.Entity> {
        const labels = this.store.labelRepo.getEntitiesInRange(line.startIndex, line.endIndex);
        const labelViews = labels.map(it => new LabelView.Entity(it, line.topContext, this.config));
        labelViews.map(it => this.labelViewRepository.add(it));
        labelViews.map(it => line.topContext.addChild(it));
        return labelViews;
    }

    private constructConnectionsForLine(line: Line.Entity): Array<ConnectionView.Entity> {
        const labels = this.store.labelRepo.getEntitiesInRange(line.startIndex, line.endIndex);
        return labels.map(label => {
            const connections = label.sameLineConnections.filter(it => !this.connectionViewRepository.has(it.id));
            const connectionViews = connections.map(it => new ConnectionView.Entity(it, line.topContext, this.config));
            connectionViews.map(it => this.connectionViewRepository.add(it));
            connectionViews.map(it => line.topContext.addChild(it));
            return connectionViews;
        }).reduce((a, b) => a.concat(b), []);
    }

    private get height() {
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
        this.store.labelRepo.on('created', this.onLabelCreated.bind(this));
        this.store.labelRepo.on('deleted', (label: Label.Entity) => {

        });
        this.store.connectionRepo.on('created', this.onConnectionCreated.bind(this));
    }

    private removeLine(line: Line.Entity) {
        line.remove();
        line.topContext.children.forEach(it => {
            if (it instanceof LabelView.Entity) {
                this.labelViewRepository.delete(it);
            } else if (it instanceof ConnectionView.Entity) {
                this.connectionViewRepository.delete(it);
            }
        });
    }

    private rerenderLines(beginLineIndex: number, endInLineIndex) {
        for (let i = beginLineIndex; i <= endInLineIndex; ++i) {
            this.removeLine(this.lines[i]);
        }
        const begin = this.lines[beginLineIndex];
        const endIn = this.lines[endInLineIndex];
        const newDividedLines = divideLines(
            begin.startIndex, endIn.endIndex,
            begin.last, endIn.next,
            this, this.contentFont, this.lineMaxWidth
        );
        this.lines.splice(beginLineIndex, endInLineIndex - beginLineIndex + 1, ...newDividedLines);
        if (beginLineIndex === 0) {
            newDividedLines[0].insertBefore(endIn.next.toNullable());
        } else {
            newDividedLines[0].insertAfter(begin.last.toNullable());
        }
        for (let i = 1; i < newDividedLines.length; ++i) {
            newDividedLines[i].insertAfter(newDividedLines[i - 1]);
        }
        newDividedLines.map(line => {
            let labelViews = this.constructLabelViewsForLine(line);
            labelViews.map(it => line.topContext.renderChild(it));
        });
        for (let line of newDividedLines) {
            let connectionViews = this.constructConnectionsForLine(line);
            connectionViews.map(it => line.topContext.renderChild(it));
        }
        for (let line of newDividedLines) {
            line.update();
            line.topContext.update();
        }
    }

    private onLabelCreated(label: Label.Entity) {
        let startInLineIndex: number = null;
        let endInLineIndex: number = null;
        this.lines.forEach((line: Line.Entity, index: number) => {
            if (line.startIndex <= label.startIndex && label.startIndex < line.endIndex) {
                startInLineIndex = index;
            }
            if (line.startIndex <= label.endIndex - 1 && label.endIndex - 1 < line.endIndex) {
                endInLineIndex = index + 1;
            }
        });
        // in one line
        if (endInLineIndex === startInLineIndex + 1) {
            const line = this.lines[startInLineIndex];
            const labelView = new LabelView.Entity(label, line.topContext, this.config);
            this.labelViewRepository.add(labelView);
            line.topContext.addChild(labelView);
            line.topContext.renderChild(labelView);
            line.topContext.update();
            line.update();
        } else {
            // in many lines
            let i: number;
            for (i = startInLineIndex; i < this.lines.length && !this.lines[i].endWithHardLineBreak; ++i) {
            }
            const hardLineEndInIndex = i < this.lines.length ? i : i - 1;
            this.rerenderLines(startInLineIndex, hardLineEndInIndex);
        }
        let currentLine = this.lines[startInLineIndex];
        while (currentLine.next.isSome) {
            currentLine.topContext.update();
            currentLine = currentLine.next.toNullable();
        }
        currentLine.topContext.update();
        this.svgElement.style.height = this.height.toString() + 'px';
    }

    private onConnectionCreated(connection: Connection.Entity) {
        const sameLineLabelView = this.labelViewRepository.get(connection.sameLineLabel.id);
        const context = sameLineLabelView.lineIn.topContext;
        const connectionView = new ConnectionView.Entity(connection, context, this.config);
        context.addChild(connectionView);
        context.renderChild(connectionView);
        context.update();
        sameLineLabelView.lineIn.update();
        let currentLine = sameLineLabelView.lineIn;
        while (currentLine.next.isSome) {
            currentLine.topContext.update();
            currentLine = currentLine.next.toNullable();
        }
        currentLine.topContext.update();
    }
}