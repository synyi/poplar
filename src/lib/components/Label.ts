export class Label {
    public id;
    public category;
    public pos = [0,0];
    public lineNo;
    constructor(id, category, pos) {
        this.id = id;
        this.category = category;
        this.pos[0] = pos[0];
        this.pos[1] = pos[1];
    }

    public isTruncate(pos) {
        return (this.pos[0] <= pos && this.pos[1] > pos);
    }
}

export class LabelContainer {
    private labels = [];
    private lineMap = {};

    public create(id, category, pos) {
        this.insert(new Label(id, category, pos));
    }

    public push(label:Label) {
        this.insert(label);
    }

    public get(id) {
        return this.labels[id];
    }

    public get length() {
        return this.labels.length;
    }

    public gen(label) {
        return this.labels;
    }

    private insert(target) {
        let i = 0;
        for (let label of this.labels) {
            if (label.pos[0] < target.pos[0])
                i += 1;
        }
        this.labels.splice(i, 0, target);
    }


}