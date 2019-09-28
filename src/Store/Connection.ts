import {Base} from "../Infrastructure/Repository";
import {Store} from "./Store";
import {ConnectionCategory} from "./ConnectionCategory";
import {Label} from "./Label";

export namespace Connection {
    export interface JSON {
        id: number;
        categoryId: number;
        fromId: number;
        toId: number;
    }

    export class Entity {
        constructor(
            public readonly id: number,
            public readonly categoryId: number,
            public readonly fromId: number,
            public readonly toId: number,
            private readonly root: Store
        ) {
        }

        get category(): ConnectionCategory.Entity {
            return this.root.connectionCategoryRepo.get(this.categoryId);
        }

        get from(): Label.Entity {
            return this.root.labelRepo.get(this.fromId);
        }

        get to(): Label.Entity {
            return this.root.labelRepo.get(this.toId);
        }

        get priorLabel(): Label.Entity {
            if (this.from.startIndex < this.to.startIndex) {
                return this.from;
            } else {
                return this.to;
            }
        }

        get posteriorLabel(): Label.Entity {
            if (this.from.startIndex >= this.to.startIndex) {
                return this.from;
            } else {
                return this.to;
            }
        }

        get json(): JSON {
            return {
                id: this.id,
                categoryId: this.categoryId,
                fromId: this.fromId,
                toId: this.toId
            }
        }
    }

    export interface Config {
        readonly allowMultipleConnection: "notAllowed" | "differentCategory" | "allowed"
    }

    export class Repository extends Base.Repository<Entity> {
        readonly root: Store;

        constructor(private config: Config) {
            super();
        }

        set(key: number, value: Entity): this {
            if (!this.againstMultipleConnectionRuleWith(value)) {
                super.set(key, value);
            } else {
                console.warn("try set a label against the checkMultipleLabel rule!");
            }
            return this;
        }

        add(value: Entity): number {
            if (!this.againstMultipleConnectionRuleWith(value)) {
                return super.add(value);
            } else {
                console.warn("try add a label against the checkMultipleLabel rule!");
            }
            return -1;
        }

        private againstMultipleConnectionRuleWith(other: Entity): boolean {
            const sameFromToCheck = (entityA: Entity, entityB: Entity) => entityA.from === entityB.from && entityA.to === entityB.to;
            const sameFromToCategoryCheck = (entityA: Entity, entityB: Entity) => sameFromToCheck(entityA, entityB) && entityA.categoryId == entityB.categoryId;
            const sameCheck = this.config.allowMultipleConnection === "notAllowed" ? sameFromToCheck : sameFromToCategoryCheck;
            return Array.from(this.values()).some(it => sameCheck(it, other));
        }
    }

    export namespace Factory {
        export function create(json: JSON, root: Store): Entity {
            return new Entity(json.id, json.categoryId, json.fromId, json.toId, root);
        }

        export function createAll(json: Array<JSON>, root: Store): Array<Entity> {
            return json.map(it => create(it, root));
        }
    }
}
