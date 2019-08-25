import {IAction} from "./IAction";
import {Store} from "../Store/Store";

export namespace Content {
    export class SpliceAction implements IAction {
        constructor(
            public readonly startIndex: number,
            public readonly removeLength: number,
            public readonly insert: string) {
        }

        apply(store: Store) {
            store.spliceContent(this.startIndex, this.removeLength, this.insert);
        }
    }

    export function Splice(startIndex: number, removeLength: number, insert: string) {
        return new SpliceAction(startIndex, removeLength, insert);
    }
}
