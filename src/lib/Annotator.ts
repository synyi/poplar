/**
 * Created by grzhan on 16/7/1.
 */
/// <reference path="../svgjs/svgjs.d.ts" />
import {TextSelector, SelectorDummyException} from './util/TextSelector';
import {Draw} from './util/Draw';

export enum Categories {
    "diagnosis" = 1,
    "sign&symptom" = 2,
    "assessment" = 3,
    "treatment" = 4
}

export class Annotator {
    public svg;                // SVG Root DOM Element (wrapped by svg.js)
    public group = {};         // SVG Groups
    public lines = {};         // Content lines (including annotation parts and text parts)
    public category = [
        {id:1, fill: 'red', boader: '#148414', highlight: 'rgba(118,236,127,0.4)', text: 'diagnosis'},
        {id:2, fill: 'lightgreen', boader: '#148414', highlight: 'rgba(118,236,127,0.4)', text: 'sign&symptom'},
        {id:3, fill: 'yellow', boader: '#148414', highlight: 'rgba(118,236,127,0.4)', text: 'assessment'},
        {id:4, fill: 'blue', boader: '#148414', highlight: 'rgba(118,236,127,0.4)', text: 'treatment'}
    ];
    public selectable = false;

    private style = {
        padding: 10,
        baseLeft: 30,
        rectColor: '',
        width: 0,
        height: 0
    };
    private draw;
    
    constructor(container, width, height) {
        this.svg = (SVG as any)(container).size(width, height);
        this.style.width = width;
        this.style.height = height;
        this.group = {
            highlight: this.svg.group(),
            text: this.svg.group(),
            annotation: []
        };
        this.lines = {
            text: [],
            highlight: [],
            annotation: this.group['annotation'],
            raw: []
        };
        this.draw = new Draw(this);
        // Add Event Listener
        let that = this;
        if (this.selectable) {
            window.addEventListener('mouseup', () => { that.selectionEventHandler(); });
        }
    }

    public import(raw:String, labels) {
        let slices = raw.split(/(.*?[\n\r。])/g);
        let lines = [];
        for (let slice of slices) {
            if (slice.length < 1) continue;
            lines.push(slice);
        }
        console.log(lines);
        let baseTop = 0;
        let baseLeft = this.style.baseLeft;
        let maxWidth = 0;
        for (let i=0; i<lines.length; i++) {
            let text = this.draw.textline(i+1, lines[i], baseLeft, baseTop);
            let width = text.node.clientWidth + baseLeft;
            if (width > maxWidth) maxWidth = width;
            this.lines['text'].push(text);
            this.lines['annotation'].push([]);
            this.lines['highlight'].push([]);
            this.lines['raw'].push(lines[i]);
            baseTop += this.style.padding + text.node.clientHeight;
        }
        this.style.height = baseTop;
        for (let label of labels) {
            let {x,y,no} = this.posInLine(label['pos'][0], label['pos'][1]);
            let startAt = this.lines['text'][no - 1].node.getExtentOfChar(x);
            let endAt = this.lines['text'][no -1].node.getExtentOfChar(y);
            let selector = {
                lineNo: no,
                width: endAt.x - startAt.x + endAt.width,
                height: startAt.height,
                left: startAt.x,
                top: startAt.y
            };
            console.log(selector);
            this.draw.label(label.category, selector);
        }
        console.log(maxWidth);
        this.style.width = maxWidth + 100;
        this.svg.size(maxWidth + 100, this.style.height);
    }

    public stringify() {

    }

    private selectionEventHandler() {
        try {
            let selector = TextSelector.rect();
            selector['lineNo'] = TextSelector.lineNo();
            this.draw.label(2, selector);
        } catch (e) {
            if (e instanceof SelectorDummyException) {
                return;
            }
            throw e;
        }
    }

    private clone(src) {
        return JSON.parse(JSON.stringify(src));
    }

    private posInLine(x,y) {
        let lineNo = 0;
        for (let raw of this.lines['raw']) {
            lineNo += 1;
            if (x - raw.length < 0) break;
            x -= raw.length;
        }
        for (let raw of this.lines['raw']) {
            if (y - raw.length < 0) break;
            y -= raw.length;
        }
        console.log(`x:${x}, y:${y}, line:${lineNo}`);
        if (x > y) throw new InvalidLabelError(`Invalid selection, x:${x}, y:${y}, line no: ${lineNo}`);
        return {x,y,no: lineNo};
    }

    private cleanup() {

    }
}

class InvalidLabelError extends Error {
    constructor(message) {
        super(message);
        this.message = message;
    }
}