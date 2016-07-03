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

    public import(raw:String) {
        let lines = raw.split('\n');
        let baseTop = 0;
        let baseLeft = this.style.padding;
        for (let i=0; i<lines.length; i++) {
            let text = this.draw.textline(i+1, lines[i], baseLeft, baseTop);
            this.lines['text'].push(text);
            this.lines['annotation'].push([]);
            this.lines['highlight'].push([]);
            this.lines['raw'].push(lines[i]);
            baseTop += this.style.padding + text.node.clientHeight;
        }
    }

    public stringify() {

    }

    private selectionEventHandler() {
        try {
            this.draw.label();
        } catch (e) {
            if (e instanceof SelectorDummyException) {
                return;
            }
            throw e;
        }
    }
}
