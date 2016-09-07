/**
 * Created by grzhan on 16/7/1.
 */
/// <reference path="../typings/svgjs.d.ts" />
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
    "time"=12,
    "instrument"=13,
    "location"=14,
    "unit"=15,
    "degree"=16,
    "bool"=17,
    "privacy"=18,
    "probability"=19
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
    public category = [];
    public labelsSVG = [];
    public linkable = false;
    public underscorable = false;
    public progress = 0;
    private config = {
        visible:{
            'relation': true,
            'highlight': true,
            'label': true
        },
        style:{
            padding: 10,
            baseLeft: 30,
            rectColor:'',
            bgColor:'white',
            width: 0,
            height: 0
        },
        puncLen : 80,
        linesPerRender : 15,
        selectable : false
    };
    private draw;
    private raw;
    private labelLineMap = {};
    private relationLineMap = {};
    private labels : LabelContainer;
    private background = undefined;
    private baseTop = 0;
    private baseLeft = 0;
    private maxWidth = 0;
    private labelSelected = false;
    private selectedLabel = {};
    private trackLine = null;
    private _state = States.Init;
    private get state() {
        return this._state;
    }
    private set state(value) {
        let name = States[value];
        this.emit('state changed', name);
        this.emit(`state ${name.toLowerCase()}`);
        this._state = value;
    }

    constructor(container, config = {}) {
        super();
        this.svg = (SVG as any)(container);
        this.init();
        this.draw = new Draw(this);
        this.svg.node.addEventListener('mouseup', (event) => {
            if (event.detail >= 2) {
                TextSelector.clear();
                return;
            }
            this.selectionParagraphEventHandler();
        });
        this.svg.node.addEventListener('click', (event) => {
            this.clickLabelEventHandler(event);
            this.clickRelationEventHandler(event);
        });
        this.svg.node.addEventListener('mousemove', (event) => {
            this.mousemoveEventHandler(event);
        });
        this.loadConfig(config);
        this.svg.size(this.config.style.width, this.config.style.height);
        // Debug code here (hook global `window`)
        window['a'] = this;
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
            relation_meta: [],
            top: 0
        };
        this.labelLineMap = {};
        this.relationLineMap = {};
        this.labels = new LabelContainer();
        this.progress = 0;
        this.raw = '';
        this.state = States.Init;
        this.background = this.group['background'].rect(0,0,this.config.style.width, this.config.style.height).fill('white');
    }

    private clear() {
        this.svg.clear();
        this.init();
    }

    private render(startAt) {
        this.requestAnimeFrame(() => {
            let linesPerRender = this.config.linesPerRender;
            try {
                let lines = this.lines['raw'];
                if (this.state !== States.Rendering || !this.svg || this.svg.node.getClientRects().length < 1) {
                    this.state = States.Interrupted;
                    throw new Error('Render is interrupted, maybe svg root element is invisible now.');
                }
                let endAt = startAt + linesPerRender > lines.length ? lines.length : startAt + linesPerRender;
                if (startAt >= lines.length) {
                    this.transformRelationMeta();
                    this.state = States.Finished;
                    return;
                }
                let style = this.config.style;
                for (let i = startAt; i < endAt; i++) {
                    // Render texts
                    this.baseTop = style.height;
                    let text = this.draw.textline(i + 1, lines[i], this.baseLeft, this.baseTop);
                    let width = Util.width(text.node) + this.baseLeft;
                    if (width > this.maxWidth) this.maxWidth = width;
                    this.lines['text'].push(text);
                    this.lines['annotation'].push([]);
                    this.lines['highlight'].push([]);
                    this.lines['relation'].push([]);
                    this.baseTop += style.padding + Util.height(text.node);
                    style.height = this.baseTop;
                    // Render annotation labels
                    if (this.lines['label'][i]) {
                        for (let label of this.lines['label'][i]) {
                            if (label.x < 0 || label.y < 0) continue;
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
                            if (relation.invalid) continue;
                            let {id, src, dst, text} = relation;
                            try {
                                this.draw.relation(id, src, dst, text);
                            } catch (e) {
                                console.error(e.message);
                                if (e.stack)
                                    console.error(e.stack);
                            }
                        }
                    }
                }
                this.config.style.width = this.maxWidth + 100;
                this.resize(this.maxWidth + 100, this.config.style.height);
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

    public loadConfig(config) {
        for (let key of Object.keys(this.config.style)) {
            if (config[key])
                this.config.style[key] = config[key];
        }
        if (config.visible) {
            for (let key of Object.keys(this.config.visible)) {
                if (config.visible[key] !== undefined)
                    this.config.visible[key]  = config.visible[key];
            }
        }
        if (config.linesPerRender) this.config.linesPerRender = config.linesPerRender;
        if (config.puncLen) this.config.puncLen = config.puncLen;
        if (config.selectable) this.config.selectable = config.selectable;
    }

    public import(raw:String, categories = [], labels = [], relations = []) {
        if (this.state == States.Rendering)
            throw new Error('Can not import data while svg is rendering...');
        this.clear();
        this.category = categories;
        this.raw = raw;
        let slices = raw.split(/(.*?[\n\r])/g)
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
        let puncLen = this.config.puncLen;
        while (slices.length > 0) {
            loopLimit += 1;
            if (loopLimit > 100000) {
                throw new Error('dead loop!');
            }
            let slice = slices.shift();
            if (slice.length < 1) continue;
            if (slice.length > puncLen) {
                if (slices.length < 1 && slice.slice(puncLen).length > 0)
                    slices[0] = slice.slice(puncLen);
                else if (slices.length > 0)
                    slices[0] = slice.slice(puncLen) + slices[0];
                slice = slice.slice(0, puncLen);
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

        this.baseTop = this.config.style.height = 10;
        this.baseLeft = this.config.style.baseLeft;
        this.maxWidth = 0;

        // Process labels
        for (let line of lines)
            this.lines['label'].push([]);
        for (let label of labels) {
            try {
                let {x, y, no} = this.posInLine(label['pos'][0], label['pos'][1]);
                this.lines['label'][no - 1].push({x, y, category: label['category'], id: label['id'], pos: label['pos']});
                this.labelLineMap[label['id']] = no;
            } catch (e) {
                if (e instanceof InvalidLabelError) {
                    console.error(e.message);
                    this.lines['label'][0].push({
                        x: -1,
                        y: -1,
                        id: label['id'],
                        category: label['category'],
                        pos: label['pos']
                    });
                    continue;
                }
                throw e;
            }
        }

        // Process relations
        for (let line of lines)
            this.lines['relation_meta'].push([]);
        for (let relation of relations) {
            let srcLineNo = this.labelLineMap[relation['src']];
            let dstLineNo = this.labelLineMap[relation['dst']];
            if (typeof srcLineNo == 'number' && typeof dstLineNo == 'number') {
                let lineNo = Math.max(srcLineNo, dstLineNo);
                let {id, src, dst, text} = relation;
                this.lines['relation_meta'][lineNo - 1].push({id, src, dst, text});
            } else {
                let {id, src, dst, text} = relation;
                this.lines['relation_mata'][0].push({
                    id,
                    src,
                    dst,
                    text,
                    invalid: false
                });
            }
        }

        // Render
        this.state = States.Rendering;
        this.render(0);
    }

    public dump() {
        let labels = this.lines['label'].reduce((labels, line) => {
            for (let label of line) {
                labels.push({
                    'id': label.id,
                    'category': label.category,
                    'pos': label.pos
                });
            }
            return labels;
        }, []);
        let relations = this.lines['relation_meta'].reduce((relations, line) => {
            for (let relation of line) {
                relations.push({
                    'id': relation.id,
                    'src': relation.src,
                    'dst': relation.dst,
                    'text': relation.text
                });
            }
            return relations;
        }, []);
        return {labels, relations};
    }

    public refresh() {
        let {labels, relations} = this.dump();
        if (this.state == States.Rendering)
            throw new Error('Refreshing is not allowed in current state');
        this.state = States.Init;
        this.import(this.raw, this.category, labels, relations);
    }

    public getConfig() {
        return JSON.parse(JSON.stringify(this.config));
    }

    public setVisiblity(component:string, visible:boolean) {
        if (this.config.visible[component] === undefined) throw new Error(`"${component}" is not a componenet of annotation-tool`);
        if (typeof visible !== 'boolean') throw new Error(`"${visible}" is not boolean`);
        this.config.visible[component] = visible;
    }

    public setStyle(attribute, value) {
        if (this.config.style[attribute])
            this.config.style[attribute] = value;
        else
            throw new Error(`"attr ${attribute}" is not found.`);
    }

    public setConfig(key:string, value:number) {
        if (this.config[key] && key !== 'style' && key !== 'visibility')
            this.config[key] = value;
    }

    public exportPNG(scale = 1, filename = 'export.png') {
        let el = this.svg.node;
        let dataUrl = 'data:image/svg+xml;utf-8,' + el.outerHTML;
        let img = document.createElement('img');
        let a = document.createElement('a') as any;
        document.body.appendChild(a);
        a.setAttribute('style', 'display: none');
        img.onload = () => {
            let canvas:any = document.createElement('canvas');
            canvas.width = scale * img.width;
            canvas.height = scale * img.height;
            let ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, img.width * scale, img.height * scale);
            if (canvas.toBlob) {
                canvas.toBlob(b=> {
                    let url = URL.createObjectURL(b);
                    a.setAttribute('href', url);
                    a.setAttribute('download', filename);
                    a.click();
                    URL.revokeObjectURL(url);
                })
            } else {
                let url = canvas.toDataURL();
                window.open(url, '_blank');
            }
        };
        img.src = dataUrl;
    }

    public resize(width, height) {
        this.svg.size(width, height);
        this.background.size(width, height);
    }

    public getLabelById(id) {
        let rect = document.querySelector(`[data-id="label-${id}"]`);
        let text = rect.nextElementSibling;
        let group = rect.parentElement;
        let highlight = document.querySelector(`[data-id="label-highlight-${id}"]`);
        return {
            id,rect,text,group,highlight,
            svg: {
                rect: SVG.get(rect.id),
                group: SVG.get(group.id),
                highlight: SVG.get(highlight.id),
                text: SVG.get(text.id)
            }
        };
    }

    public getRelationById(id) {
        let group = document.querySelector(`[data-id="relation-${id}"]`);
        let path = group.childNodes[0] as any;
        let rect = group.childNodes[1] as any;
        return {
            path, group, rect, id,
            svg: {
                group: SVG.get(group.id),
                path: SVG.get(path.id),
                rect: SVG.get(rect.id)
            }
        }
    }

    public addLabel(category, selection) {
        if (!this.config.visible['label']) return;
        let id = this.lines['label'].reduce((id,line) => {
                for (let label of line) {
                    id = Math.max(label.id, id);
                }
                return id;
            }, -1) + 1;
        let line = selection.line.start;
        this.draw.label(id, category, {
            lineNo: line,
            width: selection.rect.width,
            height: selection.rect.height,
            top: selection.rect.top,
            left: selection.rect.left
        });
        this.lines['label'][line - 1].push({
            x: selection.offset.start,
            y: selection.offset.end,
            pos: [selection.pos.start, selection.pos.end],
            category, id
        });
        this.labelLineMap[id] = line;
    }

    public removeLabel(id) {
        let dom = this.svg.node.querySelector(`[data-id="label-${id}"]`).parentElement;
        let highlight = this.svg.node.querySelector(`[data-id="label-highlight-${id}"]`);
        let remove = (lines, id) => {
            for (let line of lines) {
                for (let i = 0; i<line.length; i++) {
                    let tid = -1;
                    if (line[i] instanceof this.svg.constructor)
                        tid = line[i].attr('id');
                    else
                        tid = line[i].id;
                    if (tid == id) {
                        line.splice(i, 1);
                        return;
                    }
                }
            }
        };
        remove(this.lines['label'], id);
        remove(this.lines['highlight'], highlight.id);
        remove(this.lines['annotation'], dom.id);
        let lineNo = this.labelLineMap[id];
        let {svg: {group, rect}} = this.getLabelById(id);
        let top = group.transform()['y'] + rect.y();
        this.draw.tryMoveLineUp(lineNo);
        (SVG.get(highlight.id) as any).remove();
        (SVG.get(dom.id) as any).remove();
    }

    public setLabelCategoryById(id, category) {
        let lineNo = this.labelLineMap[id];
        if (!lineNo) throw new Error('Invalid label id');
        let labels = this.lines['label'][lineNo - 1];
        for (let label of labels) {
            if (label.id == id) {
                label.category = category;
            }
        }
        this.refresh();
    }

    public addRelation(src, dst, text) {
        if (!this.config.visible['relation']) return;
        let id = Util.autoIncrementId(this.lines['relation_meta'], 'id');
        let srcLineNo = this.labelLineMap[src];
        let dstLineNo = this.labelLineMap[dst];
        if (typeof srcLineNo == 'number' && typeof dstLineNo == 'number') {
            let lineNo = Math.min(srcLineNo, dstLineNo);
            this.relationLineMap[id] = lineNo;
            this.lines['relation_meta'][lineNo - 1].push({id, src, dst, text});
        } else {
            throw new Error(`Invalid label number: ${src}, ${dst} `);
        }
        this.draw.relation(id, src, dst, text);
    }

    public removeRelation(id) {
        Util.removeInLines(this.lines['relation_meta'], (item) => {
           return item.id == id;
        });
        Util.removeInLines(this.lines['relation'], (item) => {
            return item.attr('data-id') == `relation-${id}`;
        });
        let {svg: {group, rect}} = this.getRelationById(id);
        let top = rect.y() + group.transform()['y'];
        let lineNo = this.relationLineMap[id];
        this.draw.tryMoveLineUp(lineNo);
        this.getRelationById(id).svg.group.remove();
    }

    public removeRelationsByLabel(labelId) {
        let will_remove = [];
        for (let line of this.lines['relation_meta']) {
            for (let i = line.length - 1; i>=0; i--) {
                let {id, src, dst} = line[i];
                if (src == labelId || dst == labelId) {
                    will_remove.push(id);
                    line.splice(i ,1);
                }
            }
        }
        for (let line of this.lines['relation']) {
            for (let i = line.length - 1; i>=0; i--) {
                let id = line[i].attr('data-id').match(/^relation-(\d+)$/)[1];
                if (will_remove.indexOf(+id) >= 0) {
                    line.splice(i, 1);
                }
            }
        }
        for (let id of will_remove) {
            let {svg: {group, rect}} = this.getRelationById(id);
            let top = rect.y() + group.transform()['y'];
            let lineNo = this.relationLineMap[id];
            this.draw.tryMoveLineUp(lineNo);
            this.getRelationById(id).svg.group.remove();
        }
    }

    public clearLabelSelection() {
        this.labelSelected = false;
        this.trackLine.remove();
        this.selectedLabel = {};
    }

    private clickLabelEventHandler(event){
        let target = event.target;
        if (!target.parentElement) return;
        let previousElement = target.parentElement.previousElementSibling;
        if (target.nodeName == 'tspan' && previousElement && previousElement.nodeName == 'rect') {
            let dataId = previousElement.getAttribute('data-id');
            if (dataId) {
                let labelId =  dataId.match(/^label-(\d+)$/)[1];
                this.labelSelected = !this.labelSelected;
                if (!this.labelSelected && this.selectedLabel !== null && this.trackLine)
                    this.trackLine.remove();
                this.selectedLabel = this.getLabelById(+labelId);
                this.emit('selected label', +labelId);
            }
        }
    }

    private clickRelationEventHandler(event) {
        let target = event.target;
        if (!target.parentElement) return;
        let grandparentElement = target.parentElement.parentElement;
        if (target.nodeName == 'tspan' && grandparentElement && grandparentElement.nodeName == 'g') {
            let dataId = grandparentElement.getAttribute('data-id');
            if (dataId) {
                let relationId = dataId.match(/^relation-(\d+)$/)[1];
                this.emit('selected relation', +relationId);
            }
        }
    }

    private selectionParagraphEventHandler() {
        try {
            let {startOffset, endOffset, startLineNo, endLineNo} = TextSelector.paragraph();
            endOffset -= 1;
            let paragraph = new Paragraph(this, startLineNo, startOffset, endLineNo, endOffset);
            this.emit('selected', {
                pos: { start: paragraph.startPos, end: paragraph.endPos },
                offset: { start: paragraph.startOffset, end: paragraph.endOffset },
                line: { start: startLineNo, end: endLineNo },
                text: paragraph.text,
                rect : TextSelector.rect()
            });
            if (this.underscorable) {
                this.draw.underscore(paragraph);
            }
        } catch (e) {
            if (e instanceof SelectorDummyException)
                return;
            throw e;
        }
    }

    private mousemoveEventHandler (event) {
        if (this.labelSelected && this.config.selectable) {
            let label = this.getLabelById(this.selectedLabel['id']);
            let root = this.svg.node.getClientRects()[0];
            let {clientX: left, clientY: top } = event;
            this.draw.trackLine(label, left - root.left, top - root.top - 3);
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

    private transformRelationMeta() {
        let transformedRelationMeta = [];
        for (let line of this.lines['relation_meta']) {
            transformedRelationMeta.push([]);
            for (let relation of line) {
                let {id, src, dst} = relation;
                let srcLineNo = this.labelLineMap[src];
                let dstLineNo = this.labelLineMap[dst];
                if (typeof srcLineNo == 'number' && typeof dstLineNo == 'number') {
                    let lineNo = Math.min(srcLineNo, dstLineNo);
                    transformedRelationMeta[lineNo - 1].push(relation);
                    this.relationLineMap[id] = lineNo;
                } else {
                    transformedRelationMeta[0].push(relation);
                }
            }
        }
        this.lines['relation_meta'] = transformedRelationMeta;
    }

}

class InvalidLabelError extends Error {
    constructor(message) {
        super(message);
        this.message = message;
    }
}
