import {Label} from "../Store/Entities/Label";
import {Store} from "../Store/Store";
import {Action} from "../Action/Action";
import {Connection} from "../Store/Entities/Connection";

export class Dispatcher {
    constructor(
        private store: Store
    ) {
    }

    dispatch(action: Action.IAction) {
        if (action instanceof Action.Label.CreateLabelAction) {
            this.store.labelRepo.add(new Label.Entity(null, action.categoryId, action.startIndex, action.endIndex, this.store));
        } else if (action instanceof Action.Label.DeleteLabelAction) {
            this.store.labelRepo.delete(action.id);
        } else if (action instanceof Action.Label.UpdateLabelAction) {
            const label = this.store.labelRepo.get(action.labelId);
            const connections = label.allConnections;
            this.store.labelRepo.delete(action.labelId);
            this.store.labelRepo.add(new Label.Entity(label.id, action.categoryId, label.startIndex, label.endIndex, this.store));
            for (let connection of connections) {
                this.store.connectionRepo.delete(connection);
                this.store.connectionRepo.add(connection);
            }
        } else if (action instanceof Action.Connection.CreateConnectionAction) {
            this.store.connectionRepo.add(new Connection.Entity(null, action.categoryId, action.fromId, action.toId, this.store));
        } else if (action instanceof Action.Connection.DeleteConnectionAction) {
            this.store.connectionRepo.delete(action.id);
        } else if (action instanceof Action.Connection.UpdateConnectionAction) {
            const connection = this.store.connectionRepo.get(action.connectionId);
            this.store.connectionRepo.delete(action.connectionId);
            this.store.connectionRepo.add(new Connection.Entity(connection.id, action.categoryId, connection.from.id, connection.to.id, this.store));
        }
    }
}