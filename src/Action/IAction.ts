import {Store} from "../Store/Store";

export interface IAction {
    apply: (store: Store) => void;
}
