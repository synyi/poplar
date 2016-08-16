export declare class Label {
    id: any;
    category: any;
    pos: number[];
    lineNo: any;
    constructor(id: any, category: any, pos: any);
    isTruncate(pos: any): boolean;
}
export declare class LabelContainer {
    private labels;
    private lineMap;
    create(id: any, category: any, pos: any): void;
    push(label: Label): void;
    get(id: any): any;
    readonly length: number;
    gen(label: any): any[];
    private insert(target);
}
