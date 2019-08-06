import {Base} from "../../Infrastructure/Repository";
import {Store} from "../Store";

export namespace Connection {
    export class Entity {
        constructor(
            public readonly id: number,
            private readonly categoryId: number,
            private readonly fromId: number,
            private readonly toId: number,
            private readonly root: Store
        ) {
        }

        get category() {
            return this.root.connectionCategoryRepo.get(this.categoryId);
        }

        get from() {
            return this.root.labelRepo.get(this.fromId);
        }

        get to() {
            return this.root.labelRepo.get(this.toId);
        }

        get sameLineLabel() {
            if (this.from.startIndex < this.to.startIndex) {
                return this.from;
            } else {
                return this.to;
            }
        }

        get mayNotSameLineLabel() {
            if (this.from.startIndex >= this.to.startIndex) {
                return this.from;
            } else {
                return this.to;
            }
        }

        get json(): object {
            return {
                id: this.id,
                categoryId: this.categoryId,
                fromId: this.fromId,
                toId: this.toId
            }
        }
    }

    export class Repository extends Base.Repository<Entity> {
        readonly root: Store;

        constructor(root: Store) {
            super(root);
        }
    }

    export function construct(json: any, root: Store): Entity {
        return new Entity(parseInt(json.id), parseInt(json.categoryId), parseInt(json.fromId), parseInt(json.toId), root);
    }

    export function constructAll(json: Array<object>, root: Store): Array<Entity> {
        return json.map(it => construct(it, root));
    }
}
