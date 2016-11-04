/// <reference path="../typings/svgjs.d.ts" />
import { EventBase } from './lib/util/EventBase';
export declare class Annotator extends EventBase {
    svg: any;
    group: {};
    lines: {};
    category: any[];
    labelsSVG: any[];
    linkable: boolean;
    underscorable: boolean;
    progress: number;
    private config;
    private draw;
    private raw;
    private labelLineMap;
    private relationLineMap;
    private labels;
    private background;
    private baseTop;
    private baseLeft;
    private maxWidth;
    private labelSelected;
    private selectedLabel;
    private trackLine;
    private _state;
    private state;
    constructor(container: any, config?: {});
    private init();
    private clear();
    private render(startAt);
    loadConfig(config: any): void;
    import(raw: String, categories?: any[], labels?: any[], relations?: any[]): void;
    dump(): {
        labels: any;
        relations: any;
    };
    refresh(): void;
    getConfig(): any;
    setVisiblity(component: string, visible: boolean): void;
    setStyle(attribute: any, value: any): void;
    setConfig(key: string, value: number): void;
    exportPNG(scale?: number, filename?: string): void;
    resize(width: any, height: any): void;
    getLabelById(id: any): {
        id: any;
        rect: Element;
        text: Element;
        group: HTMLElement;
        highlight: Element;
        svg: {
            rect: svgjs.Element;
            group: svgjs.Element;
            highlight: svgjs.Element;
            text: svgjs.Element;
        };
    };
    getSelectedTextByLabelId(id: any): any;
    getRelationById(id: any): {
        path: any;
        group: Element;
        rect: any;
        id: any;
        svg: {
            group: svgjs.Element;
            path: svgjs.Element;
            rect: svgjs.Element;
        };
    };
    addLabel(category: any, selection: any): void;
    removeLabel(id: any): void;
    setLabelCategoryById(id: any, category: any): void;
    addRelation(src: any, dst: any, text: any): void;
    removeRelation(id: any): void;
    removeRelationsByLabel(labelId: any): void;
    clearLabelSelection(): void;
    displayIsMapped(bools?: any[]): void;
    private clickLabelEventHandler(event);
    private clickRelationEventHandler(event);
    private selectionParagraphEventHandler();
    private mousemoveEventHandler(event);
    private moveoverEventHandler(event);
    private moveoutEventHandler(event);
    private posInLine(x, y);
    private requestAnimeFrame(callback);
    private transformRelationMeta();
}
