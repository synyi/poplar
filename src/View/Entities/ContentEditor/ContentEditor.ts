import {View} from '../../View';
import {SVGNS} from '../../../Infrastructure/SVGNS';
import {assert} from "../../../Infrastructure/Assert";
import {Line} from "../Line/Line";
import {FontService} from "../../ValueObject/Font/Font";

export class ContentEditor {
    public characterIndex: number;
    private cursorElement: SVGPathElement;
    private hiddenTextAreaElement: HTMLTextAreaElement;
    private lineIndex: number;
    private parentSVGYOffset: number;
    private inComposition: boolean;

    constructor(
        private view: View
    ) {
        const head = document.getElementsByTagName("head")[0] as HTMLHeadElement;
        const style = document.createElement('style') as HTMLStyleElement;
        style.innerHTML = `@keyframes cursor { from { opacity: 0; } to { opacity: 1; }  }`;
        head.appendChild(style);
        this.lineIndex = 0;
        this.characterIndex = 0;
        this.inComposition = false;
    }

    render(): [SVGPathElement, HTMLTextAreaElement] {
        this.constructCaretElement();
        this.constructHiddenTextAreaElement();
        this.parentSVGYOffset = this.view.svgElement.getBoundingClientRect().top;
        this.hiddenTextAreaElement.onkeyup = (e) => {
            if (!this.inComposition) {
                switch (e.key) {
                    case 'ArrowLeft':
                        --this.characterIndex;
                        break;
                    case 'ArrowRight':
                        ++this.characterIndex;
                        break;
                    default:
                        if (this.hiddenTextAreaElement.value !== "") {
                            FontService.measureMore(this.view.contentFont, this.hiddenTextAreaElement.value, this.view.config.contentClasses, this.view.textElement);
                            const position = this.view.lines[this.lineIndex].startIndex + this.characterIndex;
                            console.log('emit', position, this.hiddenTextAreaElement.value);
                            this.view.root.emit('contentInput', position, this.hiddenTextAreaElement.value);
                            this.hiddenTextAreaElement.value = "";
                        }
                        break;
                }
                this.update();
            }
        };
        this.hiddenTextAreaElement.addEventListener('compositionstart', (e) => {
            this.inComposition = true;
        });
        this.hiddenTextAreaElement.addEventListener('compositionupdate', (e) => {
            console.log(e);
        });
        this.hiddenTextAreaElement.addEventListener('compositionend', (e) => {
            console.log(e);
            this.inComposition = false;
        });
        this.update();
        return [this.cursorElement, this.hiddenTextAreaElement];
    }

    update() {
        const x = 15 + this.view.contentFont.widthOf(this.view.lines[this.lineIndex].content.slice(0, this.characterIndex));
        this.cursorElement.setAttribute('d', `
            M${x},${this.view.lines[this.lineIndex].y}
            L${x},${this.view.lines[this.lineIndex].y + this.view.contentFont.lineHeight}
        `);
        this.hiddenTextAreaElement.style.top = `${this.parentSVGYOffset + this.view.lines[this.lineIndex].y}px`;
        this.hiddenTextAreaElement.style.left = `${this.cursorElement.getBoundingClientRect().left}px`;
    }

    caretChanged() {
        const selectionInfo = window.getSelection();
        assert(selectionInfo.type === "Caret");
        const lineEntity = (selectionInfo.anchorNode.parentNode as any as { annotatorElement: Line.Entity }).annotatorElement;
        this.lineIndex = this.view.lines.indexOf(lineEntity);
        this.characterIndex = selectionInfo.anchorOffset;
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
        // this.hiddenTextAreaElement.style.opacity = '0';
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
}
