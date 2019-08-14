import {Store} from "../Store/Store";
import {SVGNS} from "../Infrastructure/SVGNS";
import {Line} from "./Entities/Line/Line";
import {Font} from "./ValueObject/Font/Font";
import {RepositoryRoot} from "../Infrastructure/Repository";
import {LabelCategoryElement} from "./Entities/LabelView/LabelCategoryElement";
import {LabelView} from "./Entities/LabelView/LabelView";
import {ConnectionView} from "./Entities/ConnectionView/ConnectionView";
import {ConnectionCategoryElement} from "./Entities/ConnectionView/ConnectionCategoryElement";
import {Annotator} from "../Annotator";
import {Label} from "../Store/Entities/Label";
import {Connection} from "../Store/Entities/Connection";
import {LineDivideService} from "./Entities/Line/DivideService";
import {FontMeasureService} from "./ValueObject/Font/MeasureService";

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

    private lineDivideService: LineDivideService;

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
        this.svgElement.appendChild(this.textElement);

        const fontMeasureService = new FontMeasureService(this.svgElement, this.textElement);
        this.contentFont = fontMeasureService.measure(config.contentClasses, this.store.content);
        const labelText = Array.from(this.store.labelCategoryRepo.values()).map(it => it.text).join('');
        this.labelFont = fontMeasureService.measure(config.labelClasses, labelText);
        const connectionText = Array.from(this.store.connectionCategoryRepo.values()).map(it => it.text).join('');
        this.connectionFont = fontMeasureService.measure(config.labelClasses, connectionText);
        fontMeasureService.remove();

        const labelElementHeight = this.labelFont.lineHeight + 2 /*stroke*/ + 2 * config.labelPadding + config.bracketWidth;
        this.topContextLayerHeight = config.topContextMargin * 2 +
            Math.max(labelElementHeight, this.connectionFont.lineHeight);

        this.textElement.classList.add(...config.contentClasses);
        this.labelCategoryElementFactoryRepository = new LabelCategoryElement.FactoryRepository(this, config);
        this.connectionCategoryElementFactoryRepository = new ConnectionCategoryElement.FactoryRepository(this, config);

        this.lineMaxWidth = svgElement.width.baseVal.value - 30;
        this.lineDivideService = new LineDivideService(this);
        this.lines = this.lineDivideService.divide(0, this.store.content.length);
        this.lines.map(this.constructLabelViewsForLine.bind(this));
        this.lines.map(this.constructConnectionsForLine.bind(this));
        const tspans = this.lines.map(it => it.render());
        this.textElement.append(...tspans);
        this.svgElement.style.height = this.height.toString() + 'px';
        this.registerEventHandlers();
    }

    private static layoutTopContextsAfter(currentLine: Line.Entity) {
        while (currentLine.next.isSome) {
            currentLine.topContext.update();
            currentLine = currentLine.next.toNullable();
        }
        currentLine.topContext.update();
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

    public contentWidth(startIndex: number, endIndex: number): number {
        return this.contentFont.widthOf(this.store.contentSlice(startIndex, endIndex));
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

    private registerEventHandlers() {
        this.textElement.onmouseup = () => {
            if (window.getSelection().type === "Range") {
                this.root.textSelectionHandler.textSelected();
            }
        };
        this.store.labelRepo.on('created', this.onLabelCreated.bind(this));
        this.store.labelRepo.on('removed', (label: Label.Entity) => {
            let viewEntity = this.labelViewRepository.get(label.id);
            viewEntity.lineIn.topContext.removeChild(viewEntity);
            viewEntity.remove();
            this.labelViewRepository.delete(viewEntity);
            viewEntity.lineIn.topContext.update();
            viewEntity.lineIn.update();
            View.layoutTopContextsAfter(viewEntity.lineIn);
        });
        this.store.connectionRepo.on('created', this.onConnectionCreated.bind(this));
        this.store.connectionRepo.on('removed', (connection: ConnectionView.Entity) => {
            let viewEntity = this.connectionViewRepository.get(connection.id);
            viewEntity.lineIn.topContext.removeChild(viewEntity);
            viewEntity.remove();
            this.connectionViewRepository.delete(viewEntity);
            viewEntity.lineIn.topContext.update();
            viewEntity.lineIn.update();
            View.layoutTopContextsAfter(viewEntity.lineIn);
        });
    }

    private rerenderLines(beginLineIndex: number, endInLineIndex) {
        for (let i = beginLineIndex; i <= endInLineIndex; ++i) {
            this.removeLine(this.lines[i]);
        }
        const begin = this.lines[beginLineIndex];
        const endIn = this.lines[endInLineIndex];
        const newDividedLines = this.lineDivideService.divide(begin.startIndex, endIn.endIndex);
        newDividedLines[0].last = begin.last;
        newDividedLines[newDividedLines.length - 1].next = endIn.next;
        this.lines.splice(beginLineIndex, endInLineIndex - beginLineIndex + 1, ...newDividedLines);
        if (beginLineIndex === 0) {
            newDividedLines[0].insertBefore(endIn.next.toNullable());
        } else {
            newDividedLines[0].insertAfter(begin.last.toNullable());
        }
        for (let i = 1; i < newDividedLines.length; ++i) {
            newDividedLines[i].insertAfter(newDividedLines[i - 1]);
        }
        for (let line of newDividedLines) {
            let labelViews = this.constructLabelViewsForLine(line);
            labelViews.map(it => line.topContext.renderChild(it));
            let connectionViews = this.constructConnectionsForLine(line);
            connectionViews.map(it => line.topContext.renderChild(it));
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
            let hardLineEndInIndex: number;
            for (hardLineEndInIndex = startInLineIndex;
                 hardLineEndInIndex < this.lines.length - 1 && !this.lines[hardLineEndInIndex].endWithHardLineBreak;
                 ++hardLineEndInIndex) {
            }
            this.rerenderLines(startInLineIndex, hardLineEndInIndex);
        }
        View.layoutTopContextsAfter(this.lines[startInLineIndex]);
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
        View.layoutTopContextsAfter(sameLineLabelView.lineIn);
    }
}
