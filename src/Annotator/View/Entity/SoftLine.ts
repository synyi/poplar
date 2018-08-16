import {Base} from "../../../Common/Base/Repository";
import {assert} from "../../../Infrastructure/Assert";
import {HardLine} from "./HardLine";
import {merge} from "rxjs";

export namespace SoftLine {
    export class Entity {
        constructor(
            public readonly fromHardLineId: number,
            public readonly startIndex: number,
            public readonly endIndex: number
        ) {
        }

        get fromHardLine(): HardLine.Entity {
            return HardLine.repository.get(this.fromHardLineId);
        }

        get text() {
            return this.fromHardLine.text.slice(this.startIndex, this.endIndex);
        }
    }

    class Repository extends Base.Repository<Entity> {
        getIdsByFromHardLineId(fromHardLineId: number): Array<number> {
            let result = [];
            for (let [id, entity] of this.entities) {
                if (fromHardLineId === entity.fromHardLineId) {
                    result.push(id);
                }
            }
            return result;
        }
    }

    export let repository = new Repository();

    export function construct(fromHardLineId, startIndex, endIndex): number {
        assert(HardLine.repository.has(fromHardLineId));
        return repository.add(new Entity(fromHardLineId, startIndex, endIndex));
    }

    merge(HardLine.repository.elementDeleted$, HardLine.repository.elementUpdated$).subscribe((hardLineId: number) => {
        for (let id of repository.getIdsByFromHardLineId(hardLineId)) {
            repository.delete(id);
        }
    });
}