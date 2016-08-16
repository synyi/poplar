export declare class Paragraph {
    startLine: any;
    endLine: any;
    startOffset: any;
    endOffset: any;
    startPos: any;
    endPos: any;
    private context;
    constructor(context: any, startLine: any, startOffset: any, endLine: any, endOffset: any);
    calcPos(lineNo: any, offset: any): number;
}
