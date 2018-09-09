import {Base} from "../../Infrastructure/Repository";
import {Store} from "../Store";
import {assert} from "../../Infrastructure/Assert";
import {Label} from "./Label";
import {Connection} from "./Connection";

export namespace Line {
    export class Entity {
        constructor(
            public readonly id: number,
            public readonly allContent: string,
            public readonly startIndex: number,
            public readonly endIndex: number,
            private readonly root: Store
        ) {
        }

        get text() {
            return this.allContent.slice(this.startIndex, this.endIndex).replace('\n', ' ');
        }

        get labelsInThisLine(): Array<Label.Entity> {
            return this.root.labelRepo.getEntitiesInRange(this.startIndex, this.endIndex);
        }

        isLabelInThisLine(label: Label.Entity | number): boolean {
            if (typeof label === 'number') {
                label = this.root.labelRepo.get(label);
            }
            return this.startIndex <= label.startIndex && label.endIndex <= this.endIndex;
        }

        isConnectionInThisLine(connection: Connection.Entity | number): boolean {
            if (typeof connection === 'number') {
                connection = this.root.connectionRepo.get(connection);
            }
            return this.isLabelInThisLine(connection.sameLineLabel);
        }
    }

    export class Repository extends Base.Repository<Entity> {
        readonly root: Store;

        constructor(root: Store) {
            super(root);
        }
    }

    export function construct(root: Store): Array<Entity> {
        let result = [];
        const allContent = root.content.trim();
        let startIndex = 0;
        while (startIndex < allContent.length) {
            while (allContent[startIndex] === ' ' || allContent[startIndex] === '\n') {
                ++startIndex;
            }
            let endIndex = startIndex;
            while (
                !(/[！!。.？?"\n]/.test(allContent[endIndex]))
                && endIndex < allContent.length
                && endIndex - startIndex < root.config.maxLineWidth) {
                ++endIndex;
            }
            while (/[！!。.？?”"a-zA-Z]/.test(allContent[endIndex]) && endIndex < allContent.length) {
                ++endIndex;
            }
            assert(startIndex !== endIndex, "startIndex should never equals to endIndex in divideSentences!");
            // for prod env, we don't like to make the browser dead
            if (startIndex === endIndex) {
                break;
            }
            result.push(new Entity(null, allContent, startIndex, endIndex, root));
            startIndex = endIndex;
        }
        return result;
    }
}