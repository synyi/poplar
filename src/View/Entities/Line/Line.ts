import {none, Option, some} from "../../../Infrastructure/Option";
import {SVGNS} from "../../../Infrastructure/SVGNS";
import {View} from "../../View";
import {TopContext} from "./TopContext/TopContext";
import {takeWhile} from "../../../Infrastructure/Array";
import {Font} from "../../Font";

export namespace Line {
    export class Entity {
        readonly topContext: TopContext;
        readonly startIndex: number;
        readonly endIndex: number;
        private svgElement: SVGTSpanElement;
        private readonly config: { readonly lineHeight: number };

        constructor(
            startIndex: number,
            endIndex: number,
            public last: Option<Entity>,
            public next: Option<Entity>,
            readonly view: View
        ) {
            this.startIndex = startIndex;
            this.endIndex = endIndex;
            this.topContext = new TopContext(this);
            this.config = view.config;
        }

        get dy(): number {
            return this.last.match(this.view.contentFont.fontSize * this.config.lineHeight, this.view.contentFont.topToBaseLine) + this.topContext.layer * this.view.topContextLayerHeight;
        }

        get height(): number {
            return this.topContext.layer * this.view.topContextLayerHeight + this.view.contentFont.fontSize;
        }

        get y(): number {
            return takeWhile(this.view.lines, (other: Line.Entity) => other !== this)
                    .reduce((currentValue, line) => currentValue + line.height + this.view.contentFont.fontSize * (this.config.lineHeight - 1), 0)
                + this.topContext.layer * this.view.topContextLayerHeight;
        }

        get content(): string {
            if (this.view.store.content[this.endIndex - 1] === '\n') {
                return this.view.store.content.slice(this.startIndex, this.endIndex - 1);
            } else {
                return this.view.store.content.slice(this.startIndex, this.endIndex);
            }
        }

        update() {
            this.svgElement.innerHTML = this.content;
            this.svgElement.setAttribute("x", '15');
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
    }

    /**
     * warning: this function is very tricky!
     * do NOT touch unless you're very sure!
     * todo: more test!
     */
    export function constructAll(view: View, font: Font, svgElementWidth: number): Array<Entity> {
        const store = view.store;
        const result = new Array<Entity>();
        let last = none as Option<Entity>;
        const lineMaxWidth = svgElementWidth - 30;
        // "word" is kept in one token
        //                       English word                   number
        //                vvvvvvvvvvvvvvvvvvvvvvvvvvv    vvvvvvvvvvvvvvvvvvvv
        const wordReg = /([a-zA-z][a-zA-Z0-9'’]*[-|.]?)|([+\-]?[0-9.][0-9.%]*)/g;
        let tokens = [];
        let currentTokenStart = 0;
        let currentTokenEnd = 1;
        const widthOf = (startIndex: number, endIndex: number) => {
            const slice = store.contentSlice(startIndex, endIndex);
            return font.widthOf(slice);
        };
        // while currentToken ends in a label
        // merge the label into the token
        //          0123456789
        // token    [ ])
        // label      [   ])
        // out      [     ])
        const mergeLabel = (): boolean => {
            if (store.labelRepo.getEntitiesCross(currentTokenEnd - 1)
                .some(it => it.endIndex > currentTokenEnd)) {
                currentTokenEnd = store.labelRepo.getEntitiesCross(currentTokenEnd - 1)
                    .filter(it => it.endIndex > currentTokenEnd)
                    .sort((a, b) => b.endIndex - a.endIndex)[0]
                    .endIndex;
                return true;
            }
            return false;
        };
        // while currentToken ends in a word
        // merge the word into the token
        //          0123456789
        // token    [ ])
        // word       [])
        // out      [  ])
        const mergeWord = (): boolean => {
            // part of a word is still a word
            wordReg.lastIndex = 0;
            const nextWordRegTestResult = wordReg.exec(store.contentSlice(currentTokenEnd - 1, currentTokenEnd + 1));
            if (nextWordRegTestResult === null) {
                return false;
            }
            if (nextWordRegTestResult[0].length === 2) {
                ++currentTokenEnd;
                return true;
            }
            return false;
        };
        const shift = () => {
            tokens.push([currentTokenStart, currentTokenEnd]);
            currentTokenStart = currentTokenEnd;
            currentTokenEnd = currentTokenStart + 1;
        };
        const reduce = (tokensEndIndex: number) => {
            const pushNewEntity = (startIndex: number, endIndex: number) => {
                const newEntity = new Entity(startIndex, endIndex, last, none, view);
                last.map(it => it.next = some(newEntity));
                last = some(newEntity);
                result.push(newEntity);
            };

            let reduced: Array<[number, number]>;
            [reduced, tokens] = [tokens.slice(0, tokensEndIndex), tokens.slice(tokensEndIndex)];
            const startIndex = reduced[0][0];
            const endIndex = reduced[reduced.length - 1][1];
            pushNewEntity(startIndex, endIndex);
        };
        do {
            const labelsMerged = mergeLabel();
            const wordsMerged = mergeWord();
            if (!labelsMerged && !wordsMerged) {
                shift();
                if (store.content[tokens[tokens.length - 1][0]] === '\n') {
                    reduce(tokens.length);
                } else if (tokens.length === 1 && widthOf(tokens[0][0], tokens[0][tokens[0].length - 1]) > lineMaxWidth) {
                    console.warn(`the token "${store.contentSlice(tokens[0][0], tokens[0][tokens[0].length - 1])}" is too long for a line!`);
                    reduce(1);
                } else if (widthOf(tokens[0][0], tokens[tokens.length - 1][1]) > lineMaxWidth) {
                    reduce(tokens.length - 1);
                }
            }
        } while (currentTokenStart < store.content.length) ;

        return result;
    }
}
