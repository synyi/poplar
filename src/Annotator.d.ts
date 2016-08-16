/// <reference path="typings/svgjs.d.ts" />
import { EventBase } from './lib/util/EventBase';
export declare enum Categories {
    'sign&symptom' = 1,
    'diagnosis' = 2,
    'assessment' = 3,
    'treatment' = 4,
    "index" = 5,
    "drug" = 6,
    "body location" = 7,
    "frequency" = 8,
    "value" = 9,
    "change" = 10,
    "modifier" = 11,
    "time" = 12,
}
export declare class Annotator extends EventBase {
    svg: any;
    group: {};
    lines: {};
    category: {
        id: number;
        fill: string;
        boader: string;
        highlight: string;
        text: string;
    }[];
    lcategory: {
        id: number;
        text: string;
    }[];
    labelsSVG: any[];
    linkable: boolean;
    underscorable: boolean;
    progress: number;
    visible: {
        'relation': boolean;
        'highlight': boolean;
        'label': boolean;
    };
    private state;
    private style;
    private puncLen;
    private renderPerLines;
    private draw;
    private raw;
    private label_line_map;
    private labels;
    private background;
    private baseTop;
    private baseLeft;
    private maxWidth;
    private selectionCallback;
    constructor(container: any, width?: number, height?: number);
    private init();
    private clear();
    import(raw: String, labels: any, relations: any): void;
    stringify(): void;
    enableSelection(): void;
    disableSelection(): void;
    setVisiblity(component: string, visible: boolean): void;
    exportPNG(scale?: number): void;
    resize(width: any, height: any): void;
    private render(startAt);
    private selectionEventHandler();
    private selectionParagraphEventHandler();
    private posInLine(x, y);
    private requestAnimeFrame(callback);
}
