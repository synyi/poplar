import {Action} from "./Action";
import {Dispatcher} from "../Dispatcher/Dispatcher";
import {LabelCategory} from "../Store/Element/Label/LabelCategory";

export class AddLabelAction implements Action {
    actionType = 'AddLabelAction';

    protected constructor(public category: LabelCategory,
                          public startIndex: number,
                          public endIndex: number) {
    }

    static emit(category: LabelCategory, startIndex: number, endIndex: number) {
        let theAction = new AddLabelAction(category, startIndex, endIndex);
        Dispatcher.dispatch(theAction);
    }
}
