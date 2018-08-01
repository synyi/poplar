import {ConnectionManagerRecord} from "./ConnectionManagerRecord";
import {LabelView} from "../LabelView";
import {Connection} from "../../../Store/Connection";

export class Manager {
    static waitingConnections: Array<ConnectionManagerRecord> = [];

    static renderedConnections: Array<ConnectionManagerRecord> = [];

    static addLabel(label: LabelView) {
        for (let connection of this.waitingConnections) {
            if (connection.from === null && connection.store.from === label.store) {
                connection.from = label;
            }
            if (connection.to === null && connection.store.to === label.store) {
                connection.to = label;
            }
        }
    }

    static addConnection(store: Connection, addBy: LabelView) {
        if (this.waitingConnections.find(it => it.store === store)) {
            return;
        }
        this.waitingConnections.push(new ConnectionManagerRecord(store, addBy));
    }

    static renderIfPossible() {
        let readyToRender = this.waitingConnections.filter(it => it.ready);
        this.waitingConnections = this.waitingConnections.filter(it => !it.ready);
        readyToRender.map(it => {
            it.render();
        });
        this.renderedConnections.push(...readyToRender);
    }

    static rerenderIfNecessary(labelView: LabelView) {
        this.renderedConnections.map(connection => {
            if (connection.from.store === labelView.store) {
                connection.from = labelView;
                connection.rerender();
            }
            if (connection.to.store === labelView.store) {
                connection.to = labelView;
                connection.rerender();
            }
        })
    }

    static remove(from: LabelView, to: LabelView) {
        let connection = this.renderedConnections.find(it => {
            return it.from.store === from.store && it.to.store === to.store;
        });
        while (connection) {
            connection.remove();
            connection = this.renderedConnections.find(it => {
                return it.from.store === from.store && it.to.store === to.store;
            });
        }
    }
}