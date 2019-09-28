import {IAction} from "./IAction";
import {Store} from "../Store/Store";
import {Connection as ConnectionModel} from "../Store/Connection";

export namespace Connection {
    export class CreateConnectionAction implements IAction {
        constructor(
            public readonly categoryId: number,
            public readonly fromId: number,
            public readonly toId: number) {
        }

        apply(store: Store) {
            store.connectionRepo.add(new ConnectionModel.Entity(null, this.categoryId, this.fromId, this.toId, store));
        }
    }

    export function Create(categoryId: number, fromId: number, toId: number) {
        return new CreateConnectionAction(categoryId, fromId, toId);
    }

    export class DeleteConnectionAction implements IAction {
        constructor(public id: number) {
        }

        apply(store: Store) {
            store.connectionRepo.delete(this.id);
        };
    }

    export function Delete(id: number) {
        return new DeleteConnectionAction(id);
    }

    export class UpdateConnectionAction implements IAction {
        constructor(public connectionId: number, public categoryId: number) {
        }

        apply(store: Store) {
            const oldConnection = store.connectionRepo.get(this.connectionId);
            Delete(this.connectionId).apply(store);
            store.connectionRepo.add(new ConnectionModel.Entity(this.connectionId, this.categoryId, oldConnection.fromId, oldConnection.toId, store));
        }
    }

    export function Update(labelId: number, categoryId: number) {
        return new UpdateConnectionAction(labelId, categoryId);
    }
}
