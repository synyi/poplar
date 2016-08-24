/// <reference path="../../../typings/svgjs.d.ts" />
export declare class TextSelector {
    static rect(): {
        width: number;
        height: number;
        left: number;
        top: number;
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
    };
}
export declare class SelectorDummyException extends Error {
    constructor(message: any);
}
