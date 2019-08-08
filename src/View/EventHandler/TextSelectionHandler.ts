import {Annotator} from "../../Annotator";
import {Line} from "../Entities/Line/Line";
import {fromNullable} from "../../Infrastructure/Option";
import {assert} from "../../Infrastructure/Assert";

export interface Config {
    readonly selectingAreaStrip: RegExp | null | undefined
}

export class TextSelectionHandler {
    selectLengthLimit = 80;

    constructor(public root: Annotator,
                private config: Config) {
    }

    getSelectionInfo() {
        const selection = window.getSelection();
        assert(selection.type === "Range");
        let startElement = null;
        let endElement = null;
        try {
            startElement = selection.anchorNode.parentNode;
            endElement = selection.focusNode.parentNode;
        } catch (e) {
            return null;
        }
        let startLine: Line.Entity;
        let endLine: Line.Entity;
        let startIndex: number;
        let endIndex: number;
        try {
            startLine = (startElement as { annotatorElement: Line.Entity }).annotatorElement;
            endLine = (endElement as { annotatorElement: Line.Entity }).annotatorElement;
            if (startLine.view !== this.root.view || endLine.view !== this.root.view) {
                return null;
            }
            startIndex = startLine.startIndex + selection.anchorOffset;
            endIndex = startLine.startIndex + selection.focusOffset;
        } catch (e) {
            return null;
        }
        if (startIndex > endIndex) {
            [startIndex, endIndex] = [endIndex, startIndex];
        }
        fromNullable(this.config.selectingAreaStrip)
            .map(regex => {
                while (regex.test(this.root.store.content[startIndex])) {
                    ++startIndex;
                }
                while (regex.test(this.root.store.content[endIndex - 1])) {
                    --endIndex;
                }
            });
        if (startIndex >= endIndex) {
            return null;
        }
        return {
            startIndex: startIndex,
            endIndex: endIndex
        }
    }

    textSelected() {
        let selectionInfo = this.getSelectionInfo();
        if (selectionInfo) {
            this.root.emit('textSelected', selectionInfo.startIndex, selectionInfo.endIndex);
        }
        window.getSelection().removeAllRanges();
    }
}
