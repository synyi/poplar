import {Base} from "../../Infrastructure/Repository";
import {Store} from "../Store";
import {fromEvent, Observable} from "rxjs";
import {Connection} from "./Connection";

export namespace Label {
    export class Entity {
        constructor(
            public readonly id: number,
            private readonly categoryId: number,
            public readonly startIndex: number,
            public readonly endIndex: number,
            private readonly root: Store
        ) {
        }

        get category() {
            return this.root.labelCategoryRepo.get(this.categoryId);
        }

        get json(): object {
            return {
                id: this.id,
                categoryId: this.categoryId,
                startIndex: this.startIndex,
                endIndex: this.endIndex
            }
        }

        get sameLineConnections(): Array<Connection.Entity> {
            let result = [];
            for (let [_, entity] of this.root.connectionRepo) {
                if (entity.sameLineLabel === this) {
                    result.push(entity);
                }
            }
            return result;
        }

        get allConnections(): Set<Connection.Entity> {
            let result = new Set<Connection.Entity>();
            for (let [_, entity] of this.root.connectionRepo) {
                if (entity.from === this || entity.to === this) {
                    result.add(entity);
                }
            }
            return result;
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

        delete(key: number | Entity) {
            if (typeof key !== 'number') {
                key = key.id;
            }
            const entity = this.get(key);
            for (let connection of entity.allConnections) {
                this.root.connectionRepo.delete(connection);
            }
            return super.delete(key);
        }
    }

    export function construct(json: any, root: Store): Entity {
        return new Entity(parseInt(json.id), parseInt(json.categoryId), parseInt(json.startIndex), parseInt(json.endIndex), root);
    }

    export function constructAll(json: Array<any>, root: Store): Array<Entity> {
        return json.map(it => construct(it, root));
    }
}