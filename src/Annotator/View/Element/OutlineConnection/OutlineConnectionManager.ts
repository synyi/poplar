import {OutlineConnection} from "./OutlineConnection";
import {LabelView} from "../LabelView";
import {assert} from "../../../Tools/Assert";

export class OutlineConnectionManager {
    static halfCreatedConnections = new Set<OutlineConnection>();

    static addHalfCreatedConnection(connection: OutlineConnection): Boolean {
        assert(connection.from === null || connection.to === null);
        for (let conn of OutlineConnectionManager.halfCreatedConnections) {
            if (conn.store === connection.store) {
                return false;
            }
        }
        OutlineConnectionManager.halfCreatedConnections.add(connection);
        return true;
    }

    static onLabelViewReady(labelView: LabelView) {
        OutlineConnectionManager.halfCreatedConnections.forEach((connection) => {
            if (connection.from === null && connection.store.from === labelView.store) {
                connection.from = labelView;
            }
            if (connection.to === null && connection.store.to === labelView.store) {
                connection.to = labelView;

            }
        });
        OutlineConnectionManager.halfCreatedConnections.forEach((connection) => {
            if (connection.fullyConstructed) {
                OutlineConnectionManager.halfCreatedConnections.delete(connection);
                if (connection.to.context === connection.from.context) {
                    connection.to = null;
                    connection.from = null;
                } else {
                    connection.render();
                }
            }
        });
    }

}