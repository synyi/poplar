/// <reference path="../../typings/svgjs.d.ts" />
export declare class Draw {
    private board;
    private margin;
    private lineHeight;
    private shoulder;
    private needExtend;
    private style_user_select_none;
    constructor(board: any);
    highlight(selector: any, color?: string): any;
    textline(lineNo: any, content: any, left: any, top: any): any;
    annotation(id: any, cid: any, selector: any): void;
    label(id: any, cid: any, selector: any): void;
    relation(id: any, srcId: any, dstId: any, text?: string): void;
    underscore(paragraph: any): void;
    bracket(cid: any, x1: any, y1: any, x2: any, y2: any, width: any, q?: number): any;
    trackLine(label: any, left: any, top: any): void;
    tryMoveLineUp(lineNo: any): void;
    reRelations(lineNo?: number): void;
    repaintMappings(bools: any, reset?: boolean): void;
    private moveLineRight(lineNo, padding);
    private moveLineVertically(lineNo, type, delta?);
    private underscoreLine(lineNo, start, end);
    private calcAnnotationTop(text, selector);
    private calcRelationTop(lineNo, width, height, top, left);
    private isCollisionInLine(lineNo, width, height, left, top);
    private isCollision(x1, y1, w1, h1, x2, y2, w2, h2);
    private redrawRelations(lineNo);
}
