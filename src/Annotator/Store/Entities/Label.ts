import {Base} from "../../Infrastructure/Repository";
import {Store} from "../Store";
import {fromEvent, Observable} from "rxjs";

export namespace Label {
    export class Entity {
        constructor(
            public readonly id: number,
            public readonly categoryId: number,
            public readonly startIndex: number,
            public readonly endIndex: number
        ) {
        }
    }

    export class Repository extends Base.Repository<Entity> {
        readonly root: Store;
        readyToCreate$: Observable<Entity>;

        constructor(root: Store) {
            super(root);
            this.readyToCreate$ = fromEvent(this.eventEmitter, 'readyToCreate');
        }

        set(key: number, value: Entity): this {
            this.eventEmitter.emit('readyToCreate', value);
            super.set(key, value);
            return this;
        }

        getEntitiesInRange(startIndex: number, endIndex: number): Array<Entity> {
            let result = [];
            for (let [_, entity] of this) {
                if (startIndex <= entity.startIndex && entity.endIndex <= endIndex) {
                    result.push(entity);
                }
            }
            return result;
        }
    }

    export function construct(json: any): Entity {
        return new Entity(parseInt(json.id), parseInt(json.categoryId), parseInt(json.startIndex), parseInt(json.endIndex));
    }

    export function constructAll(json: Array<any>): Array<Entity> {
        return json.map(construct);
    }
}