import {Label} from "./Store/Entities/Label";
import {Store} from "./Store/Store";
import {Action} from "./Action/Action";

export class Dispatcher {
    constructor(
        private store: Store
    ) {
    }

    dispatch(action: Action.IAction) {
        if (action instanceof Action.Label.CreateLabelAction) {
            this.store.labelRepo.add(new Label.Entity(null, action.categoryId, action.startIndex, action.endIndex));
        }
    }
}