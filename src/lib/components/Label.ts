export class Label {
    public id;
    public category;
    public startPos;
    public endPos;
    public overflowLineNo;
    public lineNo;
    public startOffset;
    public endOffset;
    constructor(startPos, endPos) {
        this.startPos = startPos;
        this.endPos = endPos;
    }
}

export class LabelContainer {
    private labels = [];
    private lineMap = {};

    public create(id, category, start, end) {
        this.insert(new Label(start, end));
    }

    public push(label) {
        this.insert(label);
    }

    public gen(label) {
        return this.labels;
    }

    private insert(target) {
        let i = 0;
        for (let label of this.labels) {
            if (label.startPos < target.startPos)
                i += 1;
        }
        this.labels.splice(i, 0, target);
    }
}