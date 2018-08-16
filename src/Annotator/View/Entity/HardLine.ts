import {Base} from "../../../Common/Base/Repository";
import {Sentence} from "../Store/Sentence";
import {SoftLine} from "./SoftLine";
import {Config} from "../Config/Config";
import {Label} from "../Store/Label";
import {assert} from "../../../Infrastructure/Assert";
import {merge} from "rxjs";

export namespace HardLine {
    export class Entity {
        children: Array<number>;

        constructor(
            public readonly storeId: number
        ) {
            this.children = this.makeSoftLines();
        }

        private makeSoftLines(): Array<number> {
            let result = [];
            let startIndex = 0;
            while (startIndex < this.store.length) {
                let endIndex = startIndex + Config.SuggestLineWidth;
                if (endIndex > this.store.length) {
                    endIndex = this.store.length;
                }
                let crossLabel = Label.repository.getFirstLabelCross(this.store.startIndex + endIndex);
                while (crossLabel) {
                    endIndex = crossLabel.endIndex - this.store.startIndex;
                    crossLabel = Label.repository.getFirstLabelCross(this.store.startIndex + endIndex);
                }
                if (startIndex < endIndex) {
                    let newSoftLine = SoftLine.construct(this, startIndex, endIndex);
                    result.push(newSoftLine);
                }
                assert(startIndex !== endIndex, "startIndex should never equals to endIndex in makeSoftLines!");
                // for prod env, we don't like to make the browser dead
                if (startIndex === endIndex) {
                    break;
                }
                startIndex = endIndex;
            }
            return result;
        }

        get store(): Sentence.Entity {
            return Sentence.repository.get(this.storeId);
        }

        get text(): string {
            return this.store.text;
        }
    }

    export let repository = new Base.Repository<Entity>();

    export function construct(storeId: number) {
        repository.set(storeId, new Entity(storeId));
    }

    merge(Sentence.repository.elementCreated$, Sentence.repository.elementUpdated$).subscribe((storeId: number) => {
        construct(storeId);
    });

    Sentence.repository.elementDeleted$.subscribe((storeId: number) => {
        repository.delete(storeId);
    });
}