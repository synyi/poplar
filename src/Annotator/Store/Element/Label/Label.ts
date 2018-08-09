/**
 * 代表一个标签
 */
import {Destructable} from "../../../Common/Base/Destructable";
import {Connection} from "../Connection/Connection";
import {assert} from "../../../Common/Tools/Assert";
import {EventEmitter} from "events";
import {fromEvent, Observable} from "rxjs";
import {LabelCategory} from "./LabelCategory";

export class Label extends Destructable {
    static eventEmitter = new EventEmitter();
    static constructed$: Observable<Label> = fromEvent(Label.eventEmitter, 'constructed');
    static all: Set<Label> = new Set<Label>();
    connectionsFrom: Set<Connection> = new Set<Connection>();
    connectionsTo: Set<Connection> = new Set<Connection>();

    /**
     * constructor
     * @param category      Label所属的种类
     * @param startIndex    在*整个文本中*的开始索引
     * @param endIndex      在*整个文本中*的结束索引
     */
    constructor(
        public category: LabelCategory,
        public startIndex: number,
        public endIndex: number
    ) {
        super();
        Label.all.add(this);
        Label.eventEmitter.emit('constructed', this);
    }

    get text(): string {
        return this.category.text;
    }

    static getFirstLabelCross(index: number): Label {
        for (let label of Label.all) {
            if (label.startIndex < index && index < label.endIndex) {
                return label;
            }
        }
        return null;
    }

    _destructor() {
        this.connectionsFrom.forEach(it => it.destructor());
        this.connectionsTo.forEach(it => it.destructor());
        Label.all.delete(this);
        assert(this.connectionsFrom.size === 0);
        assert(this.connectionsTo.size === 0);
    }

    addConnectionFrom(connection: Connection) {
        connection.destructed$.subscribe(() => this.connectionsFrom.delete(connection));
        this.connectionsFrom.add(connection);
    }

    addConnectionTo(connection: Connection) {
        connection.destructed$.subscribe(() => this.connectionsTo.delete(connection));
        this.connectionsTo.add(connection);
    }
}
