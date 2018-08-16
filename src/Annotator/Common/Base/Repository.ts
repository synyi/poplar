export namespace Base {
    export class Repository<T> {
        private entities = new Map<number, T>();

        get(key: number): T {
            let result = this.entities.get(key);
            if (result)
                return result;
            return null
        }

        getID(entityToFind: T) {
            for (let [index, entity] of this.entities) {
                if (entityToFind === entity) {
                    return index
                }
            }
            return null
        }
    }

}