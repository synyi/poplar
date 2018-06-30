import {Action} from "./Action";
import {Sentence} from "../Store/Sentence";
import {Dispatcher} from "../Dispatcher/Dispatcher";

export class AddLabelAction implements Action {
    actionType = 'AddLabelAction';

    constructor(public text: string,
                public sentenceBelongTo: Sentence,
                public startIndex: number,
                public endIndex: number) {
    }

    static emit(text: string, sentenceBelongTo: Sentence, startIndex: number, endIndex: number) {
        let theAction = new AddLabelAction(text, sentenceBelongTo, startIndex, endIndex);
        Dispatcher.dispatch(theAction);
    }
}
