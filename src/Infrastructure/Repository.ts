import {assert} from "./Assert";

export interface RepositoryRoot {

}

export namespace Base {
    export class Repository<T> {
        protected entities = new Map<number, T>();
        private nextId = 0;

        constructor(public root: RepositoryRoot) {
        }

        get json(): Array<object> {
            let result = [];
            for (const entity of this.values()) {
                if ('json' in entity) {
                    result.push((entity as any).json);
                } else {
                    result.push(JSON.parse(JSON.stringify(entity)));
                }
            }
            return result;
        }

        get length(): number {
            return this.entities.size;
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
            if (!alreadyHas) {
                if (this.nextId < key + 1) {
                    this.nextId = key + 1;
                }
            }
            return this;
        }

        add(value: T): number {
            if ('id' in value) {
                let id: number = (value as any).id;
                assert(!this.has(id), `reAdd ${id}!`);
                if (id !== null) {
                    this.set(id, value);
                } else {
                    (value as any).id = this.nextId;
                    return this.add(value);
                }
                return id;
            }
            const key = this.nextId;
            this.set(key, value);
            return key;
        }

        [Symbol.iterator](): Iterator<[number, T]> {
            return this.entities[Symbol.iterator]();
        }

        delete(key: number | T): boolean {
            if (typeof key === 'number' && this.has(key)) {
                this.entities.delete(key);
                return true;
            } else if (typeof key !== 'number' && 'id' in key) {
                return this.delete((key as any).id);
            }
            return false;
        }

        values(): IterableIterator<T> {
            return this.entities.values();
        }
    }
}
