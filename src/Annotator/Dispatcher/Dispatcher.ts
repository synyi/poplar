import {Action} from "../Action/Action";

export class Dispatcher {
    static dispatchTable: { [key: string]: [(action: Action) => void] } = {};

    static dispatch(action: Action) {
        for (let correspondingBehavior of Dispatcher.dispatchTable[action.actionType]) {
            correspondingBehavior(action);
        }
    };

    static register(actionType: string, behaviour: (action: Action) => void) {
        if (Dispatcher.dispatchTable[actionType]) {
            Dispatcher.dispatchTable[actionType].push(behaviour);
        } else {
            Dispatcher.dispatchTable[actionType] = [behaviour];
        }
    }
}