/**
 * Created by grzhan on 16/6/30.
 */
/// <reference path="../../../typings/svgjs.d.ts" />
    
export class TextSelector {
    static rect(paragraph) {
        let startOffset, endOffset, startLineNo, endLineNo, tspan;
        if (!paragraph)
            ({startOffset, endOffset, startLineNo, endLineNo, tspan} = this.paragraph());
        else
            ({startOffset, endOffset, startLineNo, endLineNo, tspan} = paragraph);
        // 行首有空格的情况,针对getExtentOfChar需要hack……
        let text = tspan.textContent; let i = 0;
        let end = text.length - 1;
        while (text[end] == ' ') end -= 1;
        while (text[i] == ' ') {
            startOffset -=1; endOffset -=1; end -= 1; i+=1;
        }
        let startAt;
        let endAt;
        if (startLineNo == endLineNo) {
            startAt = tspan.getExtentOfChar(startOffset);
            endAt = tspan.getExtentOfChar(endOffset - 1);
        } else {
            startAt = tspan.getExtentOfChar(startOffset);
            endAt = tspan.getExtentOfChar(end);
        }
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
        // Deprecated
        let selection = window.getSelection();
        let startOffset = selection.anchorOffset;
        let focusOffset = selection.focusOffset;
        if (startOffset >= focusOffset && selection.anchorNode == selection.focusNode) {
            throw new SelectorDummyException('Void selection.');
        }
        if (startOffset > focusOffset) {
            [startOffset, focusOffset] = [focusOffset, startOffset];
        }
        // 选取内容的始末有空格时,忽略空格的选取
        let tspan = selection.anchorNode.parentElement as any as SVGTextContentElement;
        let text = tspan.textContent;
        while (text[startOffset] == ' ') { startOffset += 1; }
        while (text[focusOffset-1] == ' ') { focusOffset -= 1; }
        if (startOffset >= text.length || focusOffset <=0 ||
            (startOffset >= focusOffset && selection.anchorNode == selection.focusNode)) {
            throw new SelectorDummyException('Void selection.');
        }
        return {
            startOffset: startOffset,
            endOffset: focusOffset,
            startNode: selection.anchorNode,
            endNode: selection.focusNode,
            tspan: tspan
        };
    }

    static paragraph() {
        let selection = window.getSelection();
        let startOffset = selection.anchorOffset;
        let endOffset = selection.focusOffset;
        let startNode = selection.anchorNode;
        let endNode = selection.focusNode;
        if (!startNode || !startNode.parentElement || !startNode.parentElement.parentElement
            || !endNode || !endNode.parentElement || !endNode.parentElement.parentElement)
            throw new SelectorDummyException('Invalid target element');
        let startText = startNode.parentElement.parentElement as any as SVGTextContentElement;
        let endText = endNode.parentElement.parentElement as any as SVGTextContentElement;
        let startDataId = startText.getAttribute('data-id');
        let endDataId = endText.getAttribute('data-id');
        if (endDataId === null || startDataId === null) {
            throw new SelectorDummyException('Void selection');
        }
        let startLineNo = +startDataId.match(/^text-line-(\d+)$/)[1];
        let endLineNo = +endDataId.match(/^text-line-(\d+)$/)[1];
        if (startLineNo == endLineNo && startOffset == endOffset)
            throw new SelectorDummyException('Void selection');
        if (startLineNo > endLineNo || (startLineNo == endLineNo && startOffset >= endOffset)) {
            [startNode, endNode] = [endNode, startNode];
            [startOffset, endOffset] = [endOffset, startOffset];
            [startText, endText] = [endText, startText];
            [startLineNo, endLineNo] = [endLineNo, startLineNo];
        }
        // 选取内容的始末有空格时,忽略空格的选取
        let startTextContent = (startNode.parentElement as any as SVGTextContentElement).textContent;
        let endTextContent = (endNode.parentElement as any as SVGTextContentElement).textContent;
        while (startTextContent[startOffset] == ' ') { startOffset += 1; }
        while (endTextContent[endOffset-1] == ' ') { endOffset -= 1; }
        if (startOffset >= startTextContent.length || endOffset <=0 || (startOffset >= endOffset && startLineNo == endLineNo)) {
            throw new SelectorDummyException('Void selection.');
        }
        // FIXME: 不完整的获取
        let tspan = startNode.parentElement as any as SVGTextContentElement;
        return {
            startOffset,
            endOffset,
            startLineNo,
            endLineNo,
            tspan
        };
    }

    static clear() {
        let selection = window.getSelection();
        selection.removeAllRanges();
    }
}

export class SelectorDummyException extends Error {
    constructor(message) {
        super(message);
        this.message = message;
    }
}

