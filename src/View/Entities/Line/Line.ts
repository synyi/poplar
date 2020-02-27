import {none, Option, some} from "../../../Infrastructure/Option";
import {SVGNS} from "../../../Infrastructure/SVGNS";
import {View} from "../../View";
import {TopContext} from "./TopContext/TopContext";
import {takeWhile} from "../../../Infrastructure/Array";

export namespace Line {
    export interface Config {
        readonly lineHeight: number
    }

    export class ValueObject {
        readonly topContext: TopContext;
        public svgElement: SVGTSpanElement = null as any;
        private readonly config: Config;

        constructor(
            startIndex: number,
            endIndex: number,
            public last: Option<ValueObject>,
            public next: Option<ValueObject>,
            readonly view: View
        ) {
            this._startIndex = startIndex;
            this._endIndex = endIndex;
            this.topContext = new TopContext(this);
            this.config = view.config;
        }

        private _startIndex: number;

        get startIndex(): number {
            return this._startIndex;
        }

        private _endIndex: number;

        get endIndex(): number {
            return this._endIndex;
        }

        move(offset: number) {
            this._startIndex += offset;
            this._endIndex += offset;
        }

        inserted(characterCount: number) {
            this._endIndex += characterCount;
        }

        get dy(): number {
            return this.last.match(
                this.view.contentFont.fontSize * this.config.lineHeight,
                this.view.contentFont.topToBaseLine
            ) + this.topContext.layer * this.view.topContextLayerHeight;
        }

        get height(): number {
            return this.topContext.layer * this.view.topContextLayerHeight + this.view.contentFont.fontSize;
        }

        get y(): number {
            return takeWhile(this.view.lines, (other: Line.ValueObject) => other !== this)
                    .reduce((currentValue, line) => currentValue + line.height + this.view.contentFont.fontSize * (this.config.lineHeight - 1), 0)
                + this.topContext.layer * this.view.topContextLayerHeight;
        }

        get isBlank(): boolean {
            return this.view.store.content.slice(this.startIndex, this.endIndex - 1) === "";
        }

        get content(): string {
            if (this.endWithHardLineBreak) {
                if (this.isBlank) {
                    return "⮐";
                }
                return this.view.store.content.slice(this.startIndex, this.endIndex - 1);
            } else {
                return this.view.store.content.slice(this.startIndex, this.endIndex);
            }
        }

        get endWithHardLineBreak(): boolean {
            return this.view.store.content[this.endIndex - 1] === '\n';
        }

        update() {
            // safari doesn't support `white-space: pre;` very well
            // I have to replace ' ' to nbsp here
            // and replace it back when export to .svg file
            // (and safari is very slow rendering large amount of svg)
            // bad for safari!
            this.svgElement.innerHTML = this.content.replace(/ /g, "&nbsp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;");
            if (this.isBlank) {
                this.svgElement.style.fontSize = `${this.view.contentFont.fontSize / 4}px`;
            }
            this.svgElement.setAttribute("x", this.view.paddingLeft.toString());
            this.svgElement.setAttribute("dy", this.dy.toString() + 'px');
        }

        render(): SVGTSpanElement {
            this.svgElement = document.createElementNS(SVGNS, 'tspan') as SVGTSpanElement;
            const [topContextElement, backgroundElement] = this.topContext.render();
            this.view.svgElement.insertBefore(topContextElement, this.view.textElement);
            this.view.markerElement.insertAdjacentElement('afterend', backgroundElement);
            Object.assign(this.svgElement, {annotatorElement: this});
            this.update();
            return this.svgElement;
        }

        remove() {
            this.topContext.remove();
            this.svgElement.remove();
        }

        insertBefore(other: Option<Line.ValueObject>) {
            this.render();
            other.map(it => {
                it.svgElement.parentNode!.insertBefore(this.svgElement, it.svgElement);
                it.topContext.svgElement.parentNode!.insertBefore(this.topContext.svgElement, it.topContext.svgElement);
                it.topContext.backgroundElement.parentNode!.insertBefore(this.topContext.backgroundElement, it.topContext.backgroundElement);
            });
        }

        insertAfter(other: Option<Line.ValueObject>) {
            this.render();
            other.map(it => {
                it.svgElement.insertAdjacentElement("afterend", this.svgElement);
                it.topContext.svgElement.insertAdjacentElement("afterend", this.topContext.svgElement);
                it.topContext.backgroundElement.insertAdjacentElement("afterend", this.topContext.backgroundElement);
            });
        }

        insertInto(parent: SVGTextElement) {
            this.render();
            parent.appendChild(this.svgElement);
        }
    }

    interface Token {
        readonly startIndex: number;
        readonly endIndex: number;
    }

    /**
     * warning: this class is tricky!
     * do NOT touch unless you're sure!
     * todo: more test!
     */
    class LineDivideService {
        // "word" is kept in one token
        //                                 English word                   number
        //                          vvvvvvvvvvvvvvvvvvvvvvvvvvvv   vvvvvvvvvvvvvvvvvvvv
        static readonly wordReg = /([a-zA-z][a-zA-Z0-9'’]*[-|.]?)|([+\-]?[0-9.][0-9.%]*)/g;
        private result: Array<Line.ValueObject> = [];
        private tokenQueue: Array<Token> = [];

        constructor(private view: View) {
        }

        get store() {
            return this.view.store;
        }

        public divide(startIndex: number, endIndex: number): Array<Line.ValueObject> {
            this.init();
            let currentTokenStart = startIndex;
            let currentTokenEnd = startIndex + 1;
            do {
                let tokenEndAfterLabelMerged = this.mergeLabel(currentTokenEnd);
                let tokenEndAfterWordsMerged = this.mergeWord(tokenEndAfterLabelMerged);
                const noMergePerformed = tokenEndAfterLabelMerged === currentTokenEnd && tokenEndAfterLabelMerged === tokenEndAfterWordsMerged;
                if (this.store.content[currentTokenEnd - 1] === '\n') {
                    if (this.tokenQueue.length === 0) {
                        this.reduce(currentTokenEnd - 1, currentTokenEnd);
                    } else {
                        this.reduce(this.tokenQueue[0].startIndex, currentTokenEnd);
                    }
                    currentTokenStart = currentTokenEnd;
                } else if (noMergePerformed) {
                    this.shiftWithAutoReduce({startIndex: currentTokenStart, endIndex: currentTokenEnd});
                    currentTokenStart = currentTokenEnd;
                }
                ++currentTokenEnd;
            } while (currentTokenStart < endIndex);
            if (this.tokenQueue.length !== 0)
                this.reduce(this.tokenQueue[0].startIndex, this.tokenQueue[this.tokenQueue.length - 1].endIndex);
            let last: Option<Line.ValueObject> = none;
            for (let line of this.result) {
                last.map(it => it.next = some(line));
                line.last = last;
                last = some(line);
            }
            return this.result;
        }


        private init() {
            this.result = [];
            this.tokenQueue = [];
        }

        // while currentToken ends in a label
        // merge the label into the token
        //          0123456789
        // token    [ ])
        // label      [   ])
        // out      [     ])
        private mergeLabel(currentTokenEnd: number): number {
            if (this.store.labelRepo.getEntitiesCross(currentTokenEnd - 1)
                .some(it => it.endIndex > currentTokenEnd)) {
                return this.store.labelRepo.getEntitiesCross(currentTokenEnd - 1)
                    .filter(it => it.endIndex > currentTokenEnd)
                    .sort((a, b) => b.endIndex - a.endIndex)[0]
                    .endIndex;
            }
            return currentTokenEnd;
        };

        // while currentToken ends in a word
        // merge the word into the token
        //          0123456789
        // token    [ ])
        // word       [])
        // out      [  ])
        private mergeWord(currentTokenEnd: number): number {
            // part of a word is still a word
            LineDivideService.wordReg.lastIndex = 0;
            const nextWordRegTestResult = LineDivideService.wordReg.exec(this.store.contentSlice(currentTokenEnd - 1, currentTokenEnd + 1));
            if (nextWordRegTestResult === null) {
                return currentTokenEnd;
            }
            if (nextWordRegTestResult[0].length === 2) {
                return currentTokenEnd + 1;
            }
            return currentTokenEnd;
        };

        private reduce(startIndex: number, endIndex: number) {
            const newEntity = new Line.ValueObject(startIndex, endIndex, none, none, this.view);
            this.result.push(newEntity);
            this.tokenQueue = [];
        }

        private shiftWithAutoReduce(token: Token) {
            const currentQueueWidth = this.tokenQueue.length === 0 ? 0 : this.view.contentWidth(this.tokenQueue[0].startIndex, this.tokenQueue[this.tokenQueue.length - 1].endIndex);
            const currentTokenWidth = this.view.contentWidth(token.startIndex, token.endIndex);
            if (this.tokenQueue.length !== 0 && currentQueueWidth + currentTokenWidth > this.view.lineMaxWidth) {
                this.reduce(this.tokenQueue[0].startIndex, this.tokenQueue[this.tokenQueue.length - 1].endIndex);
            }
            if (currentTokenWidth > this.view.lineMaxWidth) {
                this.reduce(token.startIndex, token.endIndex);
                console.warn(`the token "${this.store.contentSlice(token.startIndex, token.endIndex)}" is too long for a line!`);
            } else {
                this.tokenQueue.push(token);
            }
        }
    }

    export namespace Service {
        export function divide(view: View, startIndex: number, endIndex: number) {
            return (new LineDivideService(view)).divide(startIndex, endIndex);
        }
    }
}
