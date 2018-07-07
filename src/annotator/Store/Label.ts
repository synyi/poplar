export class Label {
    constructor(private text: string,
                public startIndexInRawContent: number,
                public endIndexInRawContent: number) {
    }

    toString(): string {
        return this.text
    }
}
