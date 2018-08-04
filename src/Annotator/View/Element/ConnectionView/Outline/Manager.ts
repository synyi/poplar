import {OutlineConnectionView} from "./OutlineConnectionView";
import {Connection} from "../../../../Store/Connection";

export class OutlineConnectionViewManager {
    static halfCreatedConnectionViews = new Set<OutlineConnectionView>();

    static getConnectionViewBy(connection: Connection): OutlineConnectionView {
        for (let conn of OutlineConnectionViewManager.halfCreatedConnectionViews) {
            if (conn.store === connection) {
                return conn;
            }
        }
        return null;
    }

    static removeConnectionView(conn: OutlineConnectionView) {
        OutlineConnectionViewManager.halfCreatedConnectionViews.delete(conn);
    }

    static addConnectionView(conn: OutlineConnectionView) {
        OutlineConnectionViewManager.halfCreatedConnectionViews.add(conn);
    }
}