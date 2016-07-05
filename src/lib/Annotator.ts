/**
 * Created by grzhan on 16/7/1.
 */
/// <reference path="../svgjs/svgjs.d.ts" />
import {TextSelector, SelectorDummyException} from './util/TextSelector';
import {Draw} from './util/Draw';
export class Annotator {
    public svg;                // SVG Root DOM Element (wrapped by svg.js)
    public group = {};         // SVG Groups
    public lines = {};         // Content lines (including annotation parts and text parts)
    public category = [
        {id:1, fill: 'lightgreen', boader: '#148414', text: 'n_Problem'},
        {id:2, fill: 'lightgreen', boader: '#148414', text: 'test_Selector'}
    ];
    private style = {
        padding: 10,
        baseLeft: 0,
        rectColor: ''
    };
    private draw;
    
    constructor(id:String, width:Number, height:Number) {
        this.svg = (SVG as any)(id).size(width, height);
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
        window.addEventListener('mouseup', () => { that.selectionEventHandler(); });
    }

    public import(raw:String, labels) {
        let lines = raw.split('\n');
        let baseTop = 0;
        let baseLeft = this.style.padding;
        // Draw text line
        for (let i=0; i<lines.length; i++) {
            let text = this.draw.textline(i+1, lines[i], baseLeft, baseTop);
            this.lines['text'].push(text);
            window['t'] = text;
            this.lines['annotation'].push([]);
            this.lines['highlight'].push([]);
            this.lines['raw'].push(lines[i]);
            baseTop += this.style.padding + text.node.clientHeight;
        }

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
            if (x - raw.length <= 0) break;
            x -= raw.length;
        }
        for (let raw of this.lines['raw']) {
            if (y - raw.length <= 0) break;
            y -= raw.length;
        }
        return {x,y,no: lineNo};
    }
}
