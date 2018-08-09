import {RenderBehaviourOptions} from "../../../../Annotator";
import {OneShotRenderBehaviour} from "./OneShotRenderBehaviour";

export class RenderBehaviourFactory {
    static construct(option: RenderBehaviourOptions) {
        switch (option) {
            case RenderBehaviourOptions.ONE_SHOT:
                return new OneShotRenderBehaviour();
        }
    }
}