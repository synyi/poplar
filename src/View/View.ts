import {Store} from "../Store/Store";
import {SVGNS} from "../Infrastructure/SVGNS";
import {Line} from "./Entities/Line/Line";
import {Font} from "./Font";
import {LabelCategoryElement} from "./Entities/LabelView/LabelCategoryElement";
import {LabelView} from "./Entities/LabelView/LabelView";
import {ConnectionView} from "./Entities/ConnectionView/ConnectionView";
import {ConnectionCategoryElement} from "./Entities/ConnectionView/ConnectionCategoryElement";
import {Annotator} from "../Annotator";
import {Label} from "../Store/Label";
import {Connection} from "../Store/Connection";
import {ContentEditor} from "./Entities/ContentEditor/ContentEditor";
import {some} from "../Infrastructure/Option";

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
    readonly contentEditable: boolean;
}

export class View {
    readonly contentFont: Font.ValueObject;
    readonly labelFont: Font.ValueObject;
    readonly connectionFont: Font.ValueObject;

    readonly topContextLayerHeight: number;
    readonly textElement: SVGTextElement;
    readonly lines: Array<Line.ValueObject>;
    readonly lineMaxWidth: number;

    readonly labelCategoryElementFactoryRepository: LabelCategoryElement.FactoryRepository;
    readonly connectionCategoryElementFactoryRepository: ConnectionCategoryElement.FactoryRepository;
    readonly labelViewRepository: LabelView.Repository;
    readonly connectionViewRepository: ConnectionView.Repository;

    readonly markerElement: SVGMarkerElement;
    readonly store: Store;

    readonly contentEditor: ContentEditor;

    constructor(
        readonly root: Annotator,
        readonly svgElement: SVGSVGElement,
        readonly config: Config
    ) {
        this.store = root.store;
        this.labelViewRepository = new LabelView.Repository();
        this.connectionViewRepository = new ConnectionView.Repository();
        this.markerElement = View.createMarkerElement();
        this.svgElement.appendChild(this.markerElement);
        this.textElement = document.createElementNS(SVGNS, 'text') as SVGTextElement;
        this.textElement.style.whiteSpace = "pre";
        this.textElement.style.wordWrap = "normal";
        this.svgElement.appendChild(this.textElement);

        const labelText = Array.from(this.store.labelCategoryRepo.values()).map(it => it.text).join('');
        const connectionText = Array.from(this.store.connectionCategoryRepo.values()).map(it => it.text).join('');
        [this.contentFont, this.labelFont, this.connectionFont] = Font.Factory.startBatch(svgElement, this.textElement)
            .thanCreate(config.contentClasses, this.store.content)
            .thanCreate(config.labelClasses, labelText)
            .thanCreate(config.connectionClasses, connectionText)
            .endBatch();

        const labelElementHeight = this.labelFont.lineHeight + 2 /*stroke*/ + 2 * config.labelPadding + config.bracketWidth;
        this.topContextLayerHeight = config.topContextMargin * 2 +
            Math.max(labelElementHeight, this.connectionFont.lineHeight);

        this.textElement.classList.add(...config.contentClasses);

        this.labelCategoryElementFactoryRepository = new LabelCategoryElement.FactoryRepository(this, config);
        this.connectionCategoryElementFactoryRepository = new ConnectionCategoryElement.FactoryRepository(this, config);

        this.lineMaxWidth = svgElement.width.baseVal.value - 30;
        this.lines = Line.Service.divide(this, 0, this.store.content.length);
        this.lines.map(this.constructLabelViewsForLine.bind(this));
        this.lines.map(this.constructConnectionsForLine.bind(this));
        const tspans = this.lines.map(it => it.render());
        this.textElement.append(...tspans);
        this.svgElement.style.height = this.height.toString() + 'px';
        this.registerEventHandlers();
        if (this.config.contentEditable) {
            this.contentEditor = new ContentEditor(this);
            let [cursor, textArea] = this.contentEditor.render();
            this.svgElement.appendChild(cursor);
            this.svgElement.parentNode.insertBefore(textArea, this.svgElement);
        }
        this.svgElement.appendChild(this.collectStyle());
    }

    private static layoutTopContextsAfter(currentLine: Line.ValueObject) {
        while (currentLine.next.isSome) {
            currentLine.topContext.update();
            currentLine = currentLine.next.toNullable();
        }
        currentLine.topContext.update();
    }

    private constructLabelViewsForLine(line: Line.ValueObject): Array<LabelView.Entity> {
        const labels = this.store.labelRepo.getEntitiesInRange(line.startIndex, line.endIndex);
        const labelViews = labels.map(it => new LabelView.Entity(it, line.topContext, this.config));
        labelViews.map(it => this.labelViewRepository.add(it));
        labelViews.map(it => line.topContext.addChild(it));
        return labelViews;
    }

    private constructConnectionsForLine(line: Line.ValueObject): Array<ConnectionView.Entity> {
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

    private removeLine(line: Line.ValueObject) {
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
        this.textElement.onmouseup = (e) => {
            if (window.getSelection().type === "Range") {
                this.root.textSelectionHandler.textSelected();
            } else {
                if (this.config.contentEditable)
                    this.contentEditor.caretChanged(e.clientY);
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
            if (this.config.contentEditable)
                this.contentEditor.update();
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
            if (this.config.contentEditable)
                this.contentEditor.update();
        });
        if (this.config.contentEditable) {
            this.store.on('contentSpliced', this.onContentSpliced.bind(this));
        }
    }

    private rerenderLines(beginLineIndex: number, endInLineIndex: number) {
        for (let i = beginLineIndex; i <= endInLineIndex; ++i) {
            this.removeLine(this.lines[i]);
        }
        const begin = this.lines[beginLineIndex];
        const endIn = this.lines[endInLineIndex];
        const newDividedLines = Line.Service.divide(this, begin.startIndex, endIn.endIndex);
        if (newDividedLines.length !== 0) {
            newDividedLines[0].last = begin.last;
            begin.last.map(it => it.next = some(newDividedLines[0]));
            newDividedLines[newDividedLines.length - 1].next = endIn.next;
            endIn.next.map(it => it.last = some(newDividedLines[newDividedLines.length - 1]));
            this.lines.splice(beginLineIndex, endInLineIndex - beginLineIndex + 1, ...newDividedLines);
            if (beginLineIndex === 0) {
                newDividedLines[0].insertBefore(endIn.next.toNullable());
            } else {
                newDividedLines[0].insertAfter(begin.last.toNullable());
            }
        }
        for (let i = 1; i < newDividedLines.length; ++i) {
            newDividedLines[i].insertAfter(newDividedLines[i - 1]);
        }
        for (let line of newDividedLines) {
            let labelViews = this.constructLabelViewsForLine(line);
            labelViews.map(it => line.topContext.renderChild(it));
        }
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
        let [startInLineIndex, endInLineIndex] = this.findRangeInLines(label.startIndex, label.endIndex);
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
            let hardLineEndInIndex = this.findHardLineEndsInIndex(startInLineIndex);
            this.rerenderLines(startInLineIndex, hardLineEndInIndex);
        }
        View.layoutTopContextsAfter(this.lines[startInLineIndex]);
        if (this.config.contentEditable)
            this.contentEditor.update();
        this.svgElement.style.height = this.height.toString() + 'px';
    }

    private findRangeInLines(startIndex: number, endIndex: number) {
        let startInLineIndex: number = null;
        let endInLineIndex: number = null;
        this.lines.forEach((line: Line.ValueObject, index: number) => {
            if (line.startIndex <= startIndex && startIndex < line.endIndex) {
                startInLineIndex = index;
            }
            if (line.startIndex <= endIndex - 1 && endIndex - 1 < line.endIndex) {
                endInLineIndex = index + 1;
            }
        });
        return [startInLineIndex, endInLineIndex];
    }

    private onConnectionCreated(connection: Connection.Entity) {
        const sameLineLabelView = this.labelViewRepository.get(connection.priorLabel.id);
        const context = sameLineLabelView.lineIn.topContext;
        const connectionView = new ConnectionView.Entity(connection, context, this.config);
        this.connectionViewRepository.add(connectionView);
        context.addChild(connectionView);
        context.renderChild(connectionView);
        context.update();
        sameLineLabelView.lineIn.update();
        View.layoutTopContextsAfter(sameLineLabelView.lineIn);
        if (this.config.contentEditable)
            this.contentEditor.update();
        this.svgElement.style.height = this.height.toString() + 'px';
    }

    // todo: unit test
    private onContentSpliced(startIndex: number, removed: string, inserted: string) {
        if (removed !== "")
            this.onRemoved(startIndex, removed);
        if (inserted !== "")
            this.onInserted(startIndex, inserted);
    }

    private onRemoved(startIndex: number, removed: string) {
        let [startInLineIndex, _] = this.findRangeInLines(startIndex, startIndex + 1);
        if (this.lines[startInLineIndex].startIndex === startIndex - removed.length) {
            this.lines[startInLineIndex].move(-removed.length);
        } else {
            this.lines[startInLineIndex].inserted(-removed.length);
        }
        let currentLineIndex = startInLineIndex + 1;
        while (currentLineIndex < this.lines.length) {
            this.lines[currentLineIndex].move(-removed.length);
            ++currentLineIndex;
        }
        let hardLineEndInIndex = this.findHardLineEndsInIndex(startInLineIndex);

        if (removed === "\n" && this.lines[startInLineIndex].isBlank) {
            let last = this.lines[startInLineIndex].last;
            let next = this.lines[startInLineIndex].next;
            this.lines[startInLineIndex].remove();
            this.lines.splice(startInLineIndex, 1);
            last.map(it => it.next = next);
            next.map(it => it.last = last);
        } else {
            this.rerenderLines(startInLineIndex, hardLineEndInIndex);
        }
        View.layoutTopContextsAfter(this.lines[hardLineEndInIndex]);
        const asArray = Array.from(removed);
        const removedLineCount = asArray.filter(it => it === "\n").length;
        if (removedLineCount === 0) {
            this.contentEditor.characterIndex -= removed.length;
            this.contentEditor.avoidInLabel("forward");
        } else {
            if (this.contentEditor.lineIndex - removedLineCount >= 0) {
                this.contentEditor.lineIndex -= removedLineCount;
                this.contentEditor.characterIndex = this.contentEditor.line.content.length;
                this.contentEditor.avoidInLabel("forward");
            }
        }
        this.contentEditor.update();
        this.svgElement.style.height = this.height.toString() + 'px';
    }

    private onInserted(startIndex: number, inserted: string) {
        let [startInLineIndex, _] = this.findRangeInLines(startIndex, startIndex + 1);
        if (this.lines[startInLineIndex].startIndex === startIndex + inserted.length) {
            this.lines[startInLineIndex].move(inserted.length);
        } else {
            this.lines[startInLineIndex].inserted(inserted.length);
        }
        let currentLineIndex = startInLineIndex + 1;
        while (currentLineIndex < this.lines.length) {
            this.lines[currentLineIndex].move(inserted.length);
            ++currentLineIndex;
        }
        let hardLineEndInIndex = this.findHardLineEndsInIndex(startInLineIndex);
        this.rerenderLines(startInLineIndex, hardLineEndInIndex);
        View.layoutTopContextsAfter(this.lines[hardLineEndInIndex]);
        const asArray = Array.from(inserted);
        const newLineCount = asArray.filter(it => it === "\n").length;
        const lastNewLineIndex = asArray.lastIndexOf("\n");
        const afterLastNewLine = inserted.length - lastNewLineIndex;
        if (newLineCount === 0) {
            this.contentEditor.characterIndex += inserted.length;
            this.contentEditor.avoidInLabel("forward");
        } else {
            this.contentEditor.lineIndex += newLineCount;
            this.contentEditor.characterIndex = afterLastNewLine - 1;
            this.contentEditor.avoidInLabel("forward");
        }
        this.contentEditor.update();
        this.svgElement.style.height = this.height.toString() + 'px';
    }

    private findHardLineEndsInIndex(startInLineIndex: number) {
        let hardLineEndInIndex: number;
        for (hardLineEndInIndex = startInLineIndex;
             hardLineEndInIndex < this.lines.length - 1 && !this.lines[hardLineEndInIndex].endWithHardLineBreak;
             ++hardLineEndInIndex) {
        }
        return hardLineEndInIndex;
    }

    private collectStyle(): SVGStyleElement {
        const element = document.createElementNS(SVGNS, "style");
        const textClassSelector = this.config.contentClasses.map(it => "." + it)
            .join(',');
        const textStyle = `
        ${textClassSelector} {
            font-family: ${this.contentFont.fontFamily};
            font-weight: ${this.contentFont.fontWeight};
            font-size: ${this.contentFont.fontSize}px;
        }
        `;
        const labelClassSelector = this.config.labelClasses.map(it => "." + it)
            .join(',');
        const labelStyle = `
        ${labelClassSelector} {
            font-family: ${this.labelFont.fontFamily};
            font-weight: ${this.labelFont.fontWeight};
            font-size: ${this.labelFont.fontSize}px;
        }
        `;
        const connectionClassSelector = this.config.connectionClasses.map(it => "." + it)
            .join(',');
        const connectionStyle = `
        ${connectionClassSelector} {
            font-family: ${this.connectionFont.fontFamily};
            font-weight: ${this.connectionFont.fontWeight};
            font-size: ${this.connectionFont.fontSize}px;
        }
        `;
        element.innerHTML = textStyle + labelStyle + connectionStyle;
        return element;
    }
}
