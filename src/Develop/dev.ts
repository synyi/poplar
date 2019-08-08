import {Annotator} from "../Annotator";
// @ts-ignore
import * as data from "./test.json";
import {EventEmitter} from "events";

window.onload = function () {
    (window as any).annotator = new Annotator(data, document.getElementById("container"), {
        connectionWidthCalcMethod: "line"
    });
    ((window as any).annotator as EventEmitter).on('textSelected', (startIndex: number, endIndex: number) => {
        console.log(startIndex, endIndex);
    });
    ((window as any).annotator as EventEmitter).on('labelClicked', (labelId: number) => {
        console.log(labelId);
    });
    ((window as any).annotator as EventEmitter).on('twoLabelsClicked', (fromLabelId: number, toLabelId: number) => {
        console.log(fromLabelId, toLabelId);
    });
};
