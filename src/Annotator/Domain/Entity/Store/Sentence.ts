export namespace Sentence {
    export class Entity {
        constructor(
            private readonly rawPassage: string,
            public startIndex: number,
            public endIndex: number
        ) {
        }

        get text(): string {
            return this.rawPassage.slice(this.startIndex, this.endIndex)
        }
    }

    export let repository = new Base.Repository<Entity>();

    export function construct(passage: string): Array<number> {
        let result = [];
        let rawParagraph = this.toString();
        let nextStartIndex = 0;
        while (nextStartIndex < rawParagraph.length) {
            while (rawParagraph[nextStartIndex] === ' ' || rawParagraph[nextStartIndex] === '\n') {
                ++nextStartIndex;
            }
            let nextEndIndex = nextStartIndex;
            while (!(/[！。？ \n]/.test(rawParagraph[nextEndIndex])) && nextEndIndex < rawParagraph.length) {
                ++nextEndIndex;
            }
            while (/[！。？ \n]/.test(rawParagraph[nextEndIndex]) && nextEndIndex < rawParagraph.length) {
                ++nextEndIndex;
            }
            --nextEndIndex;
            while (rawParagraph[nextEndIndex] === ' ' || rawParagraph[nextEndIndex] === '\n') {
                --nextEndIndex;
            }
            ++nextEndIndex;
            result.push(repository.add(new Entity(passage, nextStartIndex, nextEndIndex)));
            assert(nextStartIndex !== nextEndIndex, "nextStartIndex should never equals to nextEndIndex in divideSentences!");
            // for prod env, we don't like to make the browser dead
            if (nextStartIndex === nextEndIndex) {
                break;
            }
            nextStartIndex = nextEndIndex;
        }
        return result;
    }
}