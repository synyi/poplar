import {EventEmitter} from "events";
import {fromEvent, Observable} from "rxjs";

export abstract class Destructable extends EventEmitter {
    beforeDestruct$: Observable<null> = fromEvent(this, 'beforeDestruct');
    destructed$: Observable<null> = fromEvent(this, 'destructed');

    _destructed = false;

    get destructed() {
        return this._destructed;
    }

    _destructor() {
    }

    destructor() {
        if (!this._destructed) {
            this.emit('beforeDestruct');
            this._destructor();
            this._destructed = true;
            this.emit('destructed');
        } else {
            console.warn(`Redestructor of ${this}`)
        }
    }
}