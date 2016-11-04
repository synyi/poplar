/// <reference path="../../../typings/svgjs.d.ts" />
export declare class TextSelector {
    static rect(): {
        width: any;
        height: any;
        left: any;
        top: any;
    };
    static lineNo(): number;
    static init(): {
        startOffset: number;
        endOffset: number;
        startNode: Node;
        endNode: Node;
        tspan: SVGTextContentElement;
    };
    static paragraph(): {
        startOffset: number;
        endOffset: number;
        startLineNo: number;
        endLineNo: number;
        tspan: SVGTextContentElement;
    };
    static clear(): void;
}
export declare class SelectorDummyException extends Error {
    constructor(message: any);
}
