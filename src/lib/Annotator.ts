/**
 * Created by grzhan on 16/7/1.
 */
/// <reference path="../typings/svgjs.d.ts" />
import {TextSelector, SelectorDummyException} from './util/TextSelector';
import {EventBase} from './util/EventBase';
import {Draw} from './util/Draw';

export enum Categories {
    'sign&symptom'=1,
    'diagnosis'=2,
    'assessment'=3,
    'treatment'=4,
    "index"=5,
    "drug"=6,
    "body location"=7,
    "frequency"=8,
    "value"=9,
    "change"=10,
    "modifier"=11,
    "time"=12
}

export class Annotator extends EventBase {
    public svg;                // SVG Root DOM Element (wrapped by svg.js)
    public group = {};         // SVG Groups
    public lines = {};         // Content lines (including annotation parts and text parts)
    public category = [
        {id:1, fill: 'rgb(174, 214, 241)',  boader: 'rgb(93, 173, 226)', highlight: 'rgba(174, 214, 241,0.4)', text: "症状、表现",},
        {id:2, fill: 'rgb(169, 204, 227)',  boader: 'rgb(84, 153, 199)', highlight: 'rgba(169, 204, 227,0.4)', text: "疾病",},
        {id:3, fill: 'rgb(210, 180, 222)',  boader: 'rgb(165, 105, 189)',highlight: 'rgba(210, 180, 222,0.4)', text: "检查、评分",},
        {id:4, fill: 'rgb(215, 189, 226)',  boader: 'rgb(175, 122, 197)',highlight: 'rgba(215, 189, 226,0.4)', text: "治疗",},
        {id:5, fill: 'rgb(245, 183, 177)',  boader: 'rgb(236, 112, 99)', highlight: 'rgba(245, 183, 177,0.4)', text: "指标",},
        {id:6, fill: 'rgb(230, 176, 170)',  boader: 'rgb(205, 97, 85)',  highlight: 'rgba(230, 176, 170,0.4)', text: "药物",},
        {id:7, fill: 'rgb(237, 187, 153)',  boader: 'rgb(245, 176, 65)', highlight: 'rgba(237, 187, 153,0.4)', text: "部位、方位",},
        {id:8, fill: 'rgb(245, 203, 167)',  boader: 'rgb(244, 208, 63)', highlight: 'rgba(245, 203, 167,0.4)', text: "频率",},
        {id:9, fill: 'rgb(250, 215, 160)',  boader: 'rgb(252, 220, 160)', highlight: 'rgba(250, 215, 160,0.4)', text: "值",},
        {id:10, fill: 'rgb(171, 235, 198)', boader: 'rgb(181, 222, 190)', highlight: 'rgba(171, 235, 198,0.4)', text: "症状变化",},
        {id:11, fill: 'rgb(169, 223, 191)', boader: 'rgb(175, 220, 190)', highlight: 'rgba(169, 223, 191,0.4)', text: "其他修饰词"},
        {id:12, fill: 'rgb(249, 231, 159)', boader: 'rgb(82, 190, 128)', highlight: 'rgba(249, 231, 159,0.4)', text: "时间",},
    ];
    public lcategory = [                // relations' label category
        {id: 1, text: 'is_duration'}
    ];

    public labelsSVG = [];
    public selectable = false;
    public linkable = false;
    public progress = 0;

    private style = {
        padding: 10,
        baseLeft: 30,
        rectColor: '',
        width: 0,
        height: 0
    };
    private puncLen = 150;
    private renderPerLines = 15;
    private draw;
    private raw;
    private label_line_map = {};
    
    constructor(container, width=500, height=500) {
        super();
        this.svg = (SVG as any)(container).size(width, height);
        this.style.width = width;
        this.style.height = height;
        this.init();
        this.draw = new Draw(this);
        // Add Event Listener
        if (this.selectable) {
            window.addEventListener('mouseup', () => { this.selectionEventHandler(); });
        }
        window.addEventListener('mouseup', () => { this.selectionParagraphEventHandler(); });
        // Debug code here (hook global `window`)
        window['d'] = this.draw;
        window['t'] = this;
    }

    private init() {
        this.group = {
            relation: this.svg.group(),
            highlight: this.svg.group(),
            text: this.svg.group(),
            annotation: []
        };
        this.lines = {
            text: [],
            highlight: [],
            annotation: this.group['annotation'],
            raw: [],
            label: [],
            relation: [],
            relation_meta: []
        };
        this.label_line_map = {};
        this.progress = 0;
        this.raw = '';
    }

    private clear() {
        this.svg.clear();
        this.init();
    }

    public import(raw:String, labels, relations) {
        this.clear();
        this.raw = raw;
        let slices = raw.split(/(.*?[\n\r。])/g);
        let lines = [];
        // Punctuate lines, according to comma and semicolon
        for (let slice of slices) {
            if (slice.length < 1) continue;
            let match = /[,，;；]/.exec(slice.slice(this.puncLen));
            while (match) {
                let point = match.index + this.puncLen;
                if (match.index > 0) {
                    lines.push(slice.slice(0, point + 1));
                    this.lines['raw'].push(slice.slice(0, point + 1));
                }
                if (slice.slice(point+1).length > 0) {
                    slice = slice.slice(point+1);
                }
                match = /[,，;；]/.exec(slice.slice(this.puncLen));
            }
            if (slice.length > 0) {
                lines.push(slice);
                this.lines['raw'].push(slice);
            }
        }
        let baseTop = this.style.height = 0;
        let baseLeft = this.style.baseLeft;
        let maxWidth = 0;

        // Process labels
        for (let label of labels) {
            try {
                let {x, y, no} = this.posInLine(label['pos'][0], label['pos'][1]);
                if (!this.lines['label'][no - 1]) this.lines['label'][no - 1] = [];
                this.lines['label'][no - 1].push({x, y, category: label['category'], id: label['id']});
                this.label_line_map[label['id']] = no;
            } catch (e) {
                if (e instanceof InvalidLabelError) {
                    console.error(e.message);
                    continue;
                }
                throw e;
            }
        }

        // Process relations
        for (let line of lines)
            this.lines['relation_meta'].push([]);
        for (let relation of relations) {
            let srcLineNo = this.label_line_map[relation['src']];
            let dstLineNo = this.label_line_map[relation['dst']];
            if (typeof srcLineNo == 'number' && typeof dstLineNo == 'number') {
                let lineNo = Math.max(srcLineNo, dstLineNo);
                this.lines['relation_meta'][lineNo - 1].push(relation);
            }
        }

        // Render
        let renderAsync = (startAt) => {
            this.requestAnimeFrame(() => {
                let endAt = startAt + this.renderPerLines > lines.length ? lines.length : startAt + this.renderPerLines;
                if (startAt >= lines.length) return;
                for (let i = startAt; i < endAt; i++) {
                    // Render texts
                    baseTop = this.style.height;
                    let text = this.draw.textline(i+1, lines[i], baseLeft, baseTop);
                    let width = text.node.clientWidth + baseLeft;
                    if (width > maxWidth) maxWidth = width;
                    this.lines['text'].push(text);
                    this.lines['annotation'].push([]);
                    this.lines['highlight'].push([]);
                    this.lines['relation'].push([]);
                    baseTop += this.style.padding + text.node.clientHeight;
                    this.style.height = baseTop;
                    // Render annotation labels
                    if (this.lines['label'][i]) {
                        for (let label of this.lines['label'][i]) {
                            let startAt = this.lines['text'][i].node.getExtentOfChar(label.x);
                            let endAt = this.lines['text'][i].node.getExtentOfChar(label.y);
                            let selector = {
                                lineNo: i+1,
                                width: endAt.x - startAt.x + endAt.width,
                                height: startAt.height,
                                left: startAt.x,
                                top: startAt.y
                            };
                            this.draw.label(label.id, label.category, selector);
                        }
                    }
                    // Render relations
                    if (this.lines['relation_meta'][i]) {
                        for (let relation of this.lines['relation_meta'][i]) {
                            let {src, dst, text} = relation;
                            this.draw.relation(src, dst, text);
                        }
                    }
                }
                this.style.width = maxWidth + 100;
                this.svg.size(maxWidth + 100, this.style.height);
                this.progress = endAt * 1.0 / lines.length;
                this.emit('progress', this.progress);
                setTimeout(() => {renderAsync(endAt)}, 10);
            });
        };
        renderAsync(0);
    }

    public stringify() {

    }

    private selectionEventHandler() {
        try {
            let selector = TextSelector.rect();
            selector['lineNo'] = TextSelector.lineNo();
            let id = this.lines['label'].reduce((s,x) => { return s+x.length;}, 0);
            this.draw.label(id, 2, selector);
            let {startOffset, endOffset} = TextSelector.init();
            this.lines['label'][selector['lineNo'] - 1].push({x:startOffset, y:endOffset-1, category: 2, id});
        } catch (e) {
            if (e instanceof SelectorDummyException) {
                return;
            }
            throw e;
        }
    }
    
    private selectionParagraphEventHandler() {
        let {startOffset, endOffset, startLineNo, endLineNo} = TextSelector.paragraph();
        endOffset -= 1;
        let startPos = this.calcPos(startLineNo, startOffset);
        let endPos = this.calcPos(endLineNo, endOffset);
        console.log(`start: ${startLineNo}, ${startOffset}, end: ${endLineNo}, ${endOffset}`);
        console.log(`start: ${startPos}, end: ${endPos}`);
        this.emit('selected', {start:startPos, end:endPos});
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
        if (x > y) throw new InvalidLabelError(`Invalid selection, x:${x}, y:${y}, line no: ${lineNo}`);
        return {x,y,no: lineNo};
    }

    private calcPos(lineNo, offset) {
        let pos = 0;
        for (let i=0; i<lineNo-1; i++) {
            pos += this.lines['raw'][i].length;
        }
        pos += offset;
        return pos;
    }

    private requestAnimeFrame(callback) {
        if (window.requestAnimationFrame)
            window.requestAnimationFrame(callback);
        else
            setTimeout(callback, 16);
    }
}

class InvalidLabelError extends Error {
    constructor(message) {
        super(message);
        this.message = message;
    }
}

class ImportProgressEvent extends Event {
    constructor(type) {
        super(type);
    }
}