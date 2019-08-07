import {Annotator} from "../Annotator";
// @ts-ignore
import * as data from "./test.json";

window.onload = function () {
    (window as any).annotator = new Annotator(data, document.getElementById("container"), {
        connectionWidthCalcMethod: "line",
    });
};
