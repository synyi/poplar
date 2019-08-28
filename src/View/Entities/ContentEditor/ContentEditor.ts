import {View} from '../../View';
import {SVGNS} from '../../../Infrastructure/SVGNS';
import {assert} from "../../../Infrastructure/Assert";
import {Line} from "../Line/Line";
import {Font} from "../../Font";
import {LabelView} from "../LabelView/LabelView";

export class ContentEditor {
    private _lineIndex: number;
    private cursorElement: SVGPathElement;
    private hiddenTextAreaElement: HTMLTextAreaElement;

    constructor(
        private view: View
    ) {
        const head = document.getElementsByTagName("head")[0] as HTMLHeadElement;
        const style = document.createElement('style') as HTMLStyleElement;
        style.innerHTML = `@keyframes cursor { from { opacity: 0; } to { opacity: 1; }  }`;
        head.appendChild(style);
        this._lineIndex = 0;
        this._characterIndex = 0;
        this.inComposition = false;
    }

    private parentSVGYOffset: number;
    private inComposition: boolean;

    private _characterIndex: number;

    get characterIndex(): number {
        return this._characterIndex;
    }

    set characterIndex(value: number) {
        if (this.view.lines[this._lineIndex].isBlank) {
            this._characterIndex = 0;
        } else {
            this._characterIndex = value;
        }
    }

    get lineIndex(): number {
        return this._lineIndex;
    }

    get line(): Line.ValueObject {
        return this.view.lines[this.lineIndex];
    }

    set lineIndex(value: number) {
        this._lineIndex = value;
    }

    render(): [SVGPathElement, HTMLTextAreaElement] {
        this.constructCaretElement();
        this.constructHiddenTextAreaElement();
        this.parentSVGYOffset = this.view.svgElement.getBoundingClientRect().top - document.getElementsByTagName('html')[0].getBoundingClientRect().top;
        this.hiddenTextAreaElement.onkeyup = (e) => {
            if (!this.inComposition) {
                switch (e.key) {
                    case 'ArrowLeft':
                        if (this.characterIndex === 0) {
                            if (this.line.last.isSome) {
                                --this.lineIndex;
                                this.characterIndex = this.line.content.length;
                            }
                        } else {
                            --this.characterIndex;
                            this.avoidInLabel("backward");
                        }
                        break;
                    case 'ArrowRight':
                        if (this.characterIndex >= this.line.content.length || this.line.isBlank) {
                            if (this.line.next.isSome) {
                                ++this.lineIndex;
                                this.characterIndex = 0;
                            }
                        } else {
                            ++this.characterIndex;
                            this.avoidInLabel("forward");
                        }
                        break;
                    case 'ArrowUp':
                        if (this.line.last.isSome)
                            --this.lineIndex;
                        this.characterIndex = Math.min(this.characterIndex, this.line.content.length);
                        this.avoidInLabel("forward");
                        break;
                    case 'ArrowDown':
                        if (this.line.next.isSome)
                            ++this.lineIndex;
                        this.characterIndex = Math.min(this.characterIndex, this.line.content.length);
                        this.avoidInLabel("forward");
                        break;
                    case 'Backspace':
                        const position = this.line.startIndex + this.characterIndex - 1;
                        this.view.root.emit('contentDelete', position, 1);
                        break;
                    default:
                        // when input compositions, finally the user
                        // will give us an " " or "enter" or "0-9" keyup
                        // and it'll still come to this
                        // it made it easier to handle them
                        // I even hadn't expected it LOL
                        if (this.hiddenTextAreaElement.value !== "") {
                            Font.Service.measureMore(this.view.contentFont, this.hiddenTextAreaElement.value, this.view.config.contentClasses, this.view.textElement);
                            const position = this.view.lines[this._lineIndex].startIndex + this.characterIndex;
                            this.view.root.emit('contentInput', position, this.hiddenTextAreaElement.value);
                            this.hiddenTextAreaElement.value = "";
                        }
                        break;
                }
                this.update();
            }
        };
        this.hiddenTextAreaElement.addEventListener('compositionstart', () => {
            this.inComposition = true;
        });
        this.hiddenTextAreaElement.addEventListener('compositionend', () => {
            this.inComposition = false;
        });
        this.update();
        this.hiddenTextAreaElement.style.opacity = '0';
        return [this.cursorElement, this.hiddenTextAreaElement];
    }

    public avoidInLabel(direction: "backward" | "forward") {
        let position = this.line.startIndex + this.characterIndex;
        const labels: Array<LabelView.Entity> = Array.from(this.line.topContext.children)
            .filter(it => it instanceof LabelView.Entity) as any;
        let overlapWith = labels.find(it => it.store.startIndex <= position - 1 && position < it.store.endIndex);
        while (overlapWith !== undefined) {
            if (direction === "forward")
                ++this.characterIndex;
            else
                --this.characterIndex;
            position = this.line.startIndex + this.characterIndex;
            overlapWith = labels.find(it => it.store.startIndex <= position - 1 && position < it.store.endIndex);
        }
    }

    update() {
        const x = 15 + this.view.contentFont.widthOf(this.line.content.slice(0, this.characterIndex));
        this.cursorElement.setAttribute('d', `
            M${x},${this.line.y}
            L${x},${this.line.y + this.view.contentFont.lineHeight}
        `);
        this.hiddenTextAreaElement.style.top = `${this.parentSVGYOffset + this.line.y}px`;
        this.hiddenTextAreaElement.style.left = `${this.cursorElement.getBoundingClientRect().left}px`;
    }

    caretChanged(y: number) {
        const selectionInfo = window.getSelection();
        assert(selectionInfo.type === "Caret");
        let clientRect = document.querySelector("svg").getClientRects()[0];
        let characterInfo = (selectionInfo.anchorNode.parentNode as SVGTSpanElement).getExtentOfChar(0);
        let lineY = clientRect.top + characterInfo.y;
        if (lineY + this.view.contentFont.lineHeight <= y) {
            const lineEntity = (selectionInfo.anchorNode.parentNode.nextSibling as any as { annotatorElement: Line.ValueObject }).annotatorElement;
            this._lineIndex = this.view.lines.indexOf(lineEntity);
            this.characterIndex = 0;
            this.avoidInLabel("forward");
        } else {
            const lineEntity = (selectionInfo.anchorNode.parentNode as any as { annotatorElement: Line.ValueObject }).annotatorElement;
            this._lineIndex = this.view.lines.indexOf(lineEntity);
            this.characterIndex = selectionInfo.anchorOffset;
            this.avoidInLabel("forward");
        }
        this.update();
        this.hiddenTextAreaElement.focus({preventScroll: true});
    }

    private constructHiddenTextAreaElement() {
        this.hiddenTextAreaElement = document.createElement('textarea');
        this.hiddenTextAreaElement.setAttribute('autocorrect', 'off');
        this.hiddenTextAreaElement.setAttribute('autocapitalize', 'off');
        this.hiddenTextAreaElement.setAttribute('spellcheck', 'false');
        this.hiddenTextAreaElement.classList.add(...this.view.config.contentClasses);
        this.hiddenTextAreaElement.style.position = 'absolute';
        this.hiddenTextAreaElement.style.padding = '0';
        this.hiddenTextAreaElement.style.width = '100vw';
        this.hiddenTextAreaElement.style.height = '1em';
        this.hiddenTextAreaElement.style.outline = 'none';
        this.hiddenTextAreaElement.style.zIndex = '-1';
        this.hiddenTextAreaElement.style.borderStyle = "none";
        this.hiddenTextAreaElement.style.fontFamily = this.view.contentFont.fontFamily;
        this.hiddenTextAreaElement.style.fontSize = `${this.view.contentFont.fontSize}px`;
        this.hiddenTextAreaElement.style.fontWeight = this.view.contentFont.fontWeight;
        this.hiddenTextAreaElement.style.opacity = '0';
    }

    private constructCaretElement() {
        this.cursorElement = document.createElementNS(SVGNS, 'path');
        this.cursorElement.setAttribute('stroke', '#000000');
        this.cursorElement.setAttribute('stroke-width', '1.5');
        this.cursorElement.style.animationName = 'cursor';
        this.cursorElement.style.animationDuration = '0.75s';
        this.cursorElement.style.animationTimingFunction = 'ease-out';
        this.cursorElement.style.animationDirection = 'alternate';
        this.cursorElement.style.animationIterationCount = 'infinite';
    }

    public hide() {
        this.cursorElement.style.display = "none";
    }

    public show() {
        this.cursorElement.style.display = "inline";
    }
}
