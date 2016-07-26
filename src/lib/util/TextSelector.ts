/**
 * Created by grzhan on 16/6/30.
 */
/// <reference path="../../typings/svgjs.d.ts" />
    
export class TextSelector {
    static rect() {
        let {startOffset, endOffset, tspan} = this.init();
        let startAt = tspan.getExtentOfChar(startOffset);
        let endAt = tspan.getExtentOfChar(endOffset - 1);
        return {
            width: endAt.x - startAt.x + endAt.width,
            height: endAt.height,
            left: startAt.x,
            top: startAt.y
        };
    }

    static lineNo() {
        let {tspan} = this.init();
        let text = tspan.parentElement;
        let num = +text.getAttribute('data-id').match(/^text-line-(\d+)$/)[1];
        return num;
    }
    
    static init() {
        let selection = window.getSelection();
        let anchorOffset = selection.anchorOffset;
        let focusOffset = selection.focusOffset;
        if (anchorOffset == focusOffset || selection.anchorNode !== selection.focusNode) {
            throw new SelectorDummyException('Void selection.');
        }
        if (anchorOffset > focusOffset) {
            [anchorOffset, focusOffset] = [focusOffset, anchorOffset];
        }
        return {
            startOffset: anchorOffset,
            endOffset: focusOffset,
            startNode: selection.anchorNode,
            endNode: selection.focusNode,
            tspan: selection.anchorNode.parentElement as any as SVGTextContentElement
        };
    }

    static paragraph() {
        let selection = window.getSelection();
        let startOffset = selection.anchorOffset;
        let endOffset = selection.focusOffset;
        let startNode = selection.anchorNode;
        let endNode = selection.focusNode;
        let startText = startNode.parentElement.parentElement as any as SVGTextContentElement;
        let endText = endNode.parentElement.parentElement as any as SVGTextContentElement;
        let startLineNo = +startText.getAttribute('data-id').match(/^text-line-(\d+)$/)[1];
        let endLineNo = +endText.getAttribute('data-id').match(/^text-line-(\d+)$/)[1];
        if (startLineNo > endLineNo || (startLineNo == endLineNo && startOffset >= endOffset)) {
            [startNode, endNode] = [endNode, startNode];
            [startOffset, endOffset] = [endOffset, startOffset];
            [startText, endText] = [endText, startText];
            [startLineNo, endLineNo] = [endLineNo, startLineNo];
        }
        return {
            startOffset,
            endOffset,
            startLineNo,
            endLineNo
        };
    }

}

export class SelectorDummyException extends Error {
    constructor(message) {
        super(message);
        this.message = message;
    }
}

