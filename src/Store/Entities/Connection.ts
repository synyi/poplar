import {Base} from "../../Infrastructure/Repository";
import {Store} from "../Store";
import {ConnectionCategory} from "./ConnectionCategory";
import {Label} from "./Label";

export namespace Connection {
    export class JSON {
        id: number;
        categoryId: number;
        fromId: number;
        toId: number;
    }

    export class Entity {
        constructor(
            public readonly id: number,
            readonly categoryId: number,
            private readonly fromId: number,
            private readonly toId: number,
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

        get sameLineLabel(): Label.Entity {
            if (this.from.startIndex < this.to.startIndex) {
                return this.from;
            } else {
                return this.to;
            }
        }

        get mayNotSameLineLabel(): Label.Entity {
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

    export class Repository extends Base.Repository<Entity> {
        readonly root: Store;

        constructor(root: Store,
                    private config: { readonly allowMultipleConnection: "notAllowed" | "differentCategory" | "allowed" }) {
            super(root);
        }

        set(key: number, value: Entity): this {
            if (!this.checkMultipleConnection(value)) {
                super.set(key, value);
            } else {
                console.warn("try set a label against the checkMultipleLabel rule!");
            }
            return this;
        }

        add(value: Entity): number {
            if (!this.checkMultipleConnection(value)) {
                return super.add(value);
            } else {
                console.warn("try add a label against the checkMultipleLabel rule!");
            }
            return -1;
        }

        private checkMultipleConnection(other: Entity): boolean {
            if (this.config.allowMultipleConnection === "notAllowed") {
                for (let entity of this.values()) {
                    if (entity.from === other.from && entity.to === other.to) {
                        return true;
                    }
                }
            } else if (this.config.allowMultipleConnection === "differentCategory") {
                for (let entity of this.values()) {
                    if (entity.from === other.from &&
                        entity.to === other.to &&
                        entity.categoryId === other.categoryId
                    ) {
                        return true;
                    }
                }
            }
            return false;
        }
    }

    export function construct(json: JSON, root: Store): Entity {
        return new Entity(json.id, json.categoryId, json.fromId, json.toId, root);
    }

    export function constructAll(json: Array<JSON>, root: Store): Array<Entity> {
        return json.map(it => construct(it, root));
    }
}
