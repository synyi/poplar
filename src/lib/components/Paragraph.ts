export class Paragraph {
    public startLine;
    public endLine;
    public startOffset;
    public endOffset;
    public startPos;
    public endPos;
    public text;
    private context;

    constructor(context, startLine, startOffset, endLine, endOffset) {
        this.context = context;
        this.startLine = startLine;
        this.endLine = endLine;
        this.startOffset = startOffset;
        this.endOffset = endOffset;
        this.startPos = this.calcPos(startLine, startOffset);
        this.endPos = this.calcPos(endLine, endOffset);
        this.text = this.context.raw.slice(this.startPos, this.endPos + 1);
    }

    public calcPos(lineNo, offset) {
        let pos = 0;
        for (let i=0; i<lineNo-1; i++) {
            pos += this.context.lines['raw'][i].length;
        }
        pos += offset;
        return pos;
    }
}