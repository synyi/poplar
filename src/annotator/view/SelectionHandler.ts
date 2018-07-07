import {AddLabelAction} from "../Action/AddLabel";

export class SelectionHandler {
    static selectLengthLimit = 80;

    static getSelectionInfo() {
        const selection = window.getSelection();
        const startElement = selection.anchorNode;
        const endElement = selection.focusNode;
        const startSoftLine = (startElement.parentNode as any).instance.annotationObject;
        const endSoftLine = (endElement.parentNode as any).instance.annotationObject;
        let startIndex = startSoftLine.correspondingStore.toTextHolderIndex(selection.anchorOffset + startSoftLine.startIndexInHard);
        let endIndex = endSoftLine.correspondingStore.toTextHolderIndex(selection.focusOffset + endSoftLine.startIndexInHard);
        if (startIndex > endIndex) {
            let temp = startIndex;
            startIndex = endIndex;
            endIndex = temp;
        }
        if (endIndex - startIndex >= this.selectLengthLimit) {
            return null;
        }
        while (startSoftLine.correspondingStore.toString()[startSoftLine.correspondingStore.toLocalIndex(startIndex)] === ' ') {
            ++startIndex;
        }
        while (startSoftLine.correspondingStore.toString()[startSoftLine.correspondingStore.toLocalIndex(endIndex) - 1] === ' ') {
            --endIndex;
        }
        if (startIndex === endIndex) {
            return null;
        }
        let selectedString = startSoftLine.correspondingStore.slice(startSoftLine.correspondingStore.toLocalIndex(startIndex), startSoftLine.correspondingStore.toLocalIndex(endIndex));
        return {
            startIndexInRaw: startIndex,
            endIndexInRaw: endIndex,
            selectedString: selectedString
        }
    }

    static textSelected() {
        let selectionInfo = SelectionHandler.getSelectionInfo();
        AddLabelAction.emit(selectionInfo.selectedString,
            selectionInfo.startIndexInRaw, selectionInfo.endIndexInRaw);
    }
}

