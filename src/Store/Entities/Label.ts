import {Base} from "../../Infrastructure/Repository";
import {Store} from "../Store";
import {Connection} from "./Connection";
import {Option} from "../../Infrastructure/option";
import {lookup} from "../../Infrastructure/array";

export namespace Label {
    interface EntityJson extends JSON {
        readonly id: number;
        readonly categoryId: number;
        readonly startIndex: number;
        readonly endIndex: number;
    }

    export class Entity {
        constructor(
            public readonly  id: number,
            private readonly categoryId: number,
            public readonly startIndex: number,
            public readonly endIndex: number,
            private readonly root: Store
        ) {
        }

        get category() {
            return this.root.labelCategoryRepo.get(this.categoryId);
        }

        get json() {
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

        constructor(root: Store) {
            super(root);
        }

        set(key: number, value: Entity): this {
            this.eventEmitter.emit('readyToCreate', value);
            super.set(key, value);
            return this;
        }

        getEntitiesInRange(startIndex: number, endIndex: number): Array<Entity> {
            return Array.from(this.entities.values())
                .filter(entity => startIndex <= entity.startIndex && entity.endIndex <= endIndex);
        }

        getEntitiesCross(index: number): Array<Entity> {
            return Array.from(this.entities.values())
                .filter(entity => entity.startIndex <= index && index < entity.endIndex);
        }

        getNextEntity(index: number): Entity | undefined {
            const asArray = Array.from(this.entities.values()).sort((a, b) => a.startIndex - b.startIndex);
            return asArray.find(it => it.endIndex > index);
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

    export function construct(json: EntityJson, root: Store): Entity {
        return new Entity(parseInt(json.id), parseInt(json.categoryId), parseInt(json.startIndex), parseInt(json.endIndex), root);
    }

    export function constructAll(json: Array<EntityJson>, root: Store): Array<Entity> {
        return json.map(it => construct(it, root));
    }

    export function latestInArray(array: Array<Entity>): Option<Entity> {
        return lookup(array.sort((a, b) => b.endIndex - a.endIndex), 0);
    }
}
