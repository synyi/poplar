import {Label} from "../../../Store/Element/Label/Label";
import {LabelView} from "../LabelView";
import {filter, first} from "rxjs/operators";
import {assert} from "../../../Common/Tools/Assert";
import {Destructable} from "../../../Common/Base/Destructable";
import {Connection} from "../../../Store/Element/Connection/Connection";
import {fromEvent, merge, Observable} from "rxjs";
import {ConnectionText} from "./ConnectionText";
import {InlineConnectionLine} from "./ConnectionLine/InlineConnectionLine";
import {OutlineConnectionLine} from "./ConnectionLine/OutlineConnectionLine";
import {ConnectionLine} from "./ConnectionLine/ConnectionLine";

class LabelViewProxy extends Destructable {
    labelViewToNull$: Observable<LabelViewProxy> = null;
    nullToLabelView$: Observable<LabelViewProxy> = null;

    constructor(public store: Label) {
        super();
        this.labelViewToNull$ = fromEvent(this, 'labelViewToNull');
        this.nullToLabelView$ = fromEvent(this, 'nullToLabelView');
        LabelView.constructed$.pipe(
            filter((it: LabelView) => it.store === this.store)
        ).subscribe((it: LabelView) => {
            this.view = it;
        });
    }

    private _view: LabelView = null;

    get view() {
        assert(this.ready);
        return this._view;
    }

    set view(value: LabelView) {
        if (this._view === null && value !== null) {
            this._view = value;
            this._view.destructed$.pipe(first())
                .subscribe(() => this.view = null);
            this.emit("nullToLabelView", this);
        } else if (this._view !== null && value === null) {
            this._view = null;
            this.emit("labelViewToNull", this);
        } else {
            assert(false);
        }
    }

    get ready() {
        return this._view !== null;
    }
}

export class ConnectionView extends Destructable {
    from: LabelViewProxy = null;
    to: LabelViewProxy = null;
    higher: LabelViewProxy = null;
    text: ConnectionText = null;
    line: ConnectionLine = null;

    constructor(public store: Connection) {
        super();
        this.from = new LabelViewProxy(store.fromLabel);
        this.to = new LabelViewProxy(store.toLabel);
        for (let ele of LabelView.all) {
            if (ele.store === this.from.store) {
                this.from.view = ele;
            }
            if (ele.store === this.to.store) {
                this.to.view = ele;
            }
        }
        if (!this.from.ready && !this.to.ready) {
            merge(this.from.nullToLabelView$, this.to.nullToLabelView$)
                .pipe(first())
                .subscribe(it => {
                    if (this.higher === null)
                        this.higher = it;
                });
        } else {
            assert(this.from.ready && this.to.ready);
            this.higher = this.from.view.globalY < this.to.view.globalY ? this.from : this.to;
            this.constructTextAndLine();
            this.line.render();
        }
        merge(this.from.nullToLabelView$, this.to.nullToLabelView$).subscribe(() => {
            if (this.from.ready && this.to.ready) {
                this.constructTextAndLine();
            }
        });
        this.store.destructed$.subscribe(() => this.destructor());
    }

    get inline(): boolean {
        return this.from.view.context === this.to.view.context;
    }

    _destructor() {
        if (this.text)
            this.text.destructor();
        if (this.line)
            this.line.destructor();
        this.from = null;
        this.to = null;
        this.higher = null;
        this.text = null;
        this.line = null;
    }

    private constructTextAndLine() {
        if (this.text)
            this.text.destructor();
        if (this.line)
            this.line.destructor();
        this.text = new ConnectionText(this);
        this.text.destructed$.pipe(first()).subscribe(() => {
            this.line.destructor();
        });
        if (this.inline)
            this.line = new InlineConnectionLine(this.text);
        else
            this.line = new OutlineConnectionLine(this.text);
    }
}