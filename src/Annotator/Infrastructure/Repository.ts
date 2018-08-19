import {EventEmitter} from 'events';
import {fromEvent, Observable} from "rxjs";
import {assert} from "./Assert";

export interface RepositoryRoot {

}

export namespace Base {
    export class Repository<T> {
        private entities = new Map<number, T>();
        private eventEmitter = new EventEmitter();
        created$: Observable<number> = fromEvent(this.eventEmitter, 'created');
        updated$: Observable<number> = fromEvent(this.eventEmitter, 'updated');
        deleted$: Observable<number> = fromEvent(this.eventEmitter, 'deleted');
        private nextId = 0;

        constructor(public root: RepositoryRoot) {
        }

        get json(): Array<object> {
            let result = [];
            for (const [_, entity] of this) {
                result.push(JSON.parse(JSON.stringify(entity)));
            }
            return result;
        }

        delete(key: number | T): boolean {
            if (typeof key === 'number' && this.has(key)) {
                this.entities.delete(key);
                this.eventEmitter.emit('deleted', key);
                return true;
            } else if (typeof key !== 'number' && key.hasOwnProperty('id')) {
                return this.delete((key as any).id);
            }
            return false;
        }

        get(key: number): T {
            assert(this.has(key), `There's no Entity which id=${key} in repo!`);
            return this.entities.get(key);
        }

        has(key: number): boolean {
            return this.entities.has(key);
        }

        set(key: number, value: T): this {
            const alreadyHas = this.has(key);
            this.entities.set(key, value);
            if (alreadyHas) {
                this.eventEmitter.emit('updated', key);
            } else {
                if (this.nextId < key + 1) {
                    this.nextId = key + 1;
                }
                this.eventEmitter.emit('created', key);
            }
            return this;
        }

        add(value: T): number {
            if (value.hasOwnProperty('id')) {
                if ((value as any).id !== null) {
                    this.set((value as any).id, value);
                } else {
                    (value as any).id = this.nextId;
                    return this.add(value);
                }
                return (value as any).id;
            }
            const key = this.nextId;
            this.set(key, value);
            return key;
        }

        [Symbol.iterator](): Iterator<[number, T]> {
            return this.entities[Symbol.iterator]();
        }
    }
}