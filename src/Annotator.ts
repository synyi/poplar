/**
 * Created by grzhan on 16/7/1.
 */
/// <reference path="./typings/svgjs.d.ts" />
import {TextSelector, SelectorDummyException} from './lib/util/TextSelector';
import {EventBase} from './lib/util/EventBase';
import {Draw} from './lib/Draw';
import {Paragraph} from './lib/components/Paragraph';
import {LabelContainer} from './lib/components/Label';
import {Util} from './lib/util/Util';

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

enum States {
    Init,
    Rendering,
    Interrupted,
    Finished
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
    public selectable = true;
    public linkable = false;
    public underscorable = false;
    public progress = 0;
    public visible = {
        'relation': true,
        'highlight': true,
        'label': true
    };
    private state = States.Init;
    private style = {
        padding: 10,
        baseLeft: 30,
        rectColor: '',
        width: 0,
        height: 0
    };
    private puncLen = 80;
    private renderPerLines = 15;
    private draw;
    private raw;
    private label_line_map = {};
    private labels : LabelContainer;
    private background = undefined;
    private baseTop = 0;
    private baseLeft = 0;
    private maxWidth = 0;

    constructor(container, width=500, height=500) {
        super();
        this.svg = (SVG as any)(container).size(width, height);
        this.style.width = width;
        this.style.height = height;
        this.init();
        this.draw = new Draw(this);
        // Add Event Listener
        if (this.selectable) {
            this.svg.node.addEventListener('mouseup', () => { this.selectionEventHandler(); });
        }
        this.svg.node.addEventListener('mouseup', () => { this.selectionParagraphEventHandler(); });
        // Debug code here (hook global `window`)
        window['d'] = this.draw;
        window['t'] = this;
    }

    private init() {
        this.group = {
            shadow: this.svg.group(),
            background: this.svg.group(),
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
        this.labels = new LabelContainer();
        this.progress = 0;
        this.raw = '';
        this.state = States.Init;
        this.background = this.group['background'].rect(0,0,this.style.width, this.style.height).fill('white');
    }

    private clear() {
        this.svg.clear();
        this.init();
    }

    public import(raw:String, labels, relations) {
        if (this.state == States.Rendering)
            throw new Error('Can not import data while svg is rendering...');
        this.clear();
        this.raw = raw;
        let slices = raw.split(/(.*?[\n\r。])/g)
            .filter((value) => { return value.length > 0 })
            .map((value) => { return value.replace('\n',' ');});
        let lines = [];
        for (let label of labels) {
            this.labels.create(label.id, label.category, label.pos);
        }
        let lineNo = 0;
        let basePos = 0;
        let loopLimit = 0;
        let labelSentinel = 0;
        while (slices.length > 0) {
            loopLimit += 1;
            if (loopLimit > 100000) {
                throw new Error('dead loop!');
            }
            let slice = slices.shift();
            if (slice.length < 1) continue;
            if (slice.length > this.puncLen) {
                if (slices.length < 1 && slice.slice(this.puncLen).length > 0)
                    slices[0] = slice.slice(this.puncLen);
                else if (slices.length > 0)
                    slices[0] = slice.slice(this.puncLen) + slices[0];
                slice = slice.slice(0, this.puncLen);
            }
            // Detect truncation
            let truncPos = basePos + slice.length - 1;
            while (true) {
                if (this.labels.length <= labelSentinel) break;
                let i = labelSentinel;
                let truncFlag = false;
                while (true) {
                    let label = this.labels.get(i);
                    if (label.pos[0] > truncPos) break;
                    if (label.isTruncate(truncPos)) {
                        truncFlag = true;
                        truncPos = label.pos[0] - 1;
                    }
                    i+=1;
                    if (this.labels.length <= i) break;
                }
                if (!truncFlag) {
                    labelSentinel = i;
                    break;
                }
            }
            if (slice.length < 1 || truncPos < basePos) continue;
            let truncOffset = truncPos - basePos + 1;
            if (slices.length > 0)
                slices[0] = slice.slice(truncOffset) + slices[0];
            else if (slice.slice(truncOffset).length > 0)
                slices[0] = slice.slice(truncOffset);
            slice = slice.slice(0, truncOffset);
            lineNo += 1;
            basePos += slice.length;
            lines.push(slice);
            this.lines['raw'].push(slice);
        }

        this.baseTop = this.style.height = 0;
        this.baseLeft = this.style.baseLeft;
        this.maxWidth = 0;

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
        this.state = States.Rendering;
        this.render(0);
    }

    public stringify() {

    }

    public setVisiblity(component:string, visible:boolean) {
        if (this.visible[component] === undefined) throw new Error(`"${component}" is not a componenet of annotation-tool`);
        if (typeof visible !== 'boolean') throw new Error(`"${visible}" is not boolean`);
        this.visible[component] = visible;
    }

    public exportPNG(scale = 1) {
        let el = this.svg.node;
        let dataUrl = 'data:image/svg+xml;utf-8,' + el.outerHTML;
        let img = document.createElement('img');
        img.onload = () => {
            let canvas:any = document.createElement('canvas');
            canvas.width = scale * img.width;
            canvas.height = scale * img.height;
            let ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, img.width * scale, img.height * scale);
            if (canvas.toBlob) {
                canvas.toBlob(b=> {
                    window.open(URL.createObjectURL(b))
                })
            } else {
                let data = canvas.toDataURL();
                window.open(data)
            }
        };
        img.src = dataUrl;
    }

    public resize(width, height) {
        this.svg.size(width, height);
        this.background.size(width, height);
    }

    private render(startAt) {
        this.requestAnimeFrame(() => {
            try {
                let lines = this.lines['raw'];
                if (this.state !== States.Rendering || !this.svg || this.svg.node.getClientRects().length < 1) {
                    this.state = States.Interrupted;
                    throw new Error('Render is interrupted, maybe svg root element is invisible now.');
                }
                let endAt = startAt + this.renderPerLines > lines.length ? lines.length : startAt + this.renderPerLines;
                if (startAt >= lines.length) {
                    this.state = States.Finished;
                    return;
                }
                for (let i = startAt; i < endAt; i++) {
                    // Render texts
                    this.baseTop = this.style.height;
                    let text = this.draw.textline(i + 1, lines[i], this.baseLeft, this.baseTop);
                    let width = Util.width(text.node) + this.baseLeft;
                    if (width > this.maxWidth) this.maxWidth = width;
                    this.lines['text'].push(text);
                    this.lines['annotation'].push([]);
                    this.lines['highlight'].push([]);
                    this.lines['relation'].push([]);
                    this.baseTop += this.style.padding + Util.height(text.node);
                    this.style.height = this.baseTop;
                    // Render annotation labels
                    if (this.lines['label'][i]) {
                        for (let label of this.lines['label'][i]) {
                            try {
                                let startAt = this.lines['text'][i].node.getExtentOfChar(label.x);
                                let endAt = this.lines['text'][i].node.getExtentOfChar(label.y);
                                let selector = {
                                    lineNo: i + 1,
                                    width: endAt.x - startAt.x + endAt.width,
                                    height: startAt.height,
                                    left: startAt.x,
                                    top: startAt.y
                                };
                                this.draw.label(label.id, label.category, selector);
                            } catch (e) {
                                if (e.name === 'IndexSizeError') {
                                    console.error('Error occured while indexing text line(最可能是标签匹配错位,请联系yjh)');
                                    if (e.stack)
                                        console.error(e.stack);
                                } else {
                                    throw e;
                                }
                            }
                        }
                    }
                    // Render relations
                    if (this.lines['relation_meta'][i]) {
                        for (let relation of this.lines['relation_meta'][i]) {
                            let {src, dst, text} = relation;
                            try {
                                this.draw.relation(src, dst, text);
                            } catch (e) {
                                console.error(e.message);
                                if (e.stack)
                                    console.error(e.stack);
                            }
                        }
                    }
                }
                this.style.width = this.maxWidth + 100;
                this.resize(this.maxWidth + 100, this.style.height);
                this.progress = endAt / lines.length;
                this.emit('progress', this.progress);
                setTimeout(() => {
                    this.render(endAt)
                }, 10);
            } catch (e) {
                console.error(e.message);
                if (e.stack)
                    console.error(e.stack);
                this.state = States.Interrupted;
            }
        });
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
        try {
            let {startOffset, endOffset, startLineNo, endLineNo} = TextSelector.paragraph();
            endOffset -= 1;
            let paragraph = new Paragraph(this, startLineNo, startOffset, endLineNo, endOffset);
            this.emit('selected', {start: paragraph.startPos, end: paragraph.endPos});
            if (this.underscorable) {
                this.draw.underscore(paragraph);
            }
        } catch (e) {
            if (e instanceof SelectorDummyException)
                return;
            throw e;
        }
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
