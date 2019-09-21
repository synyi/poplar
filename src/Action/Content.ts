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
            if (!store.config.contentEditable) {
                throw Error("Content edition is not on!")
            } else {
                store.spliceContent(this.startIndex, this.removeLength, this.insert);
            }
        }
    }

    export function Splice(startIndex: number, removeLength: number, insert: string) {
        return new SpliceAction(startIndex, removeLength, insert);
    }
}
