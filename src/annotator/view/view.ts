import {svgjs} from 'svg.js'

declare var SVG: svgjs.Library;

export class View {
    private svgjsObject: svgjs.Doc;

    constructor(
        private svgElement: HTMLElement,
        private width: number,
        private height: number
    ) {
        this.svgjsObject = SVG(svgElement);
        this.svgjsObject.size(width, height);
    }

    static getSelectionInfo() {
        const selection = window.getSelection();
        const element = selection.baseNode;
        if (element.parentElement.id === 'fake') {
            return null;
        }
        const svgInstance = (element.parentElement as any).instance;
        // 选取的是[startIndex, endIndex)之间的范围
        let startIndex = selection.anchorOffset;
        let endIndex = selection.focusOffset;
        if (startIndex > endIndex) {
            let temp = startIndex;
            startIndex = endIndex;
            endIndex = temp;
        }
        let selectedString = element.textContent;
        while (selectedString[startIndex] === ' ') {
            ++startIndex;
        }
        while (selectedString[endIndex - 1] === ' ') {
            --endIndex;
        }
        if (startIndex === endIndex) {
            return;
        }
        selectedString = selectedString.slice(startIndex, endIndex);
        let firstCharPosition = (element.parentElement as any as SVGTextContentElement).getExtentOfChar(startIndex);
        let lastCharPosition = (element.parentElement as any as SVGTextContentElement).getExtentOfChar(endIndex);
        return {
            element: element,
            svgInstance: svgInstance,
            startIndex: startIndex,
            endIndex: endIndex,
            selectedString: selectedString,
            boundingBox: {
                x: firstCharPosition.x,
                y: firstCharPosition.y,
                width: lastCharPosition.x - firstCharPosition.x,
                height: firstCharPosition.height
            }
        }
    }

    // Thanks to Alex Hornbake (function for generate curly bracket path)
    // http://bl.ocks.org/alexhornbake/6005176
    public bracket(x1, y1, x2, y2, width, q = 0.6) {
        //Calculate unit vector
        let dx = x1 - x2;
        let dy = y1 - y2;
        let len = Math.sqrt(dx * dx + dy * dy);
        dx = dx / len;
        dy = dy / len;

        //Calculate Control Points of path,
        let qx1 = x1 + q * width * dy;
        let qy1 = y1 - q * width * dx;
        let qx2 = (x1 - .25 * len * dx) + (1 - q) * width * dy;
        let qy2 = (y1 - .25 * len * dy) - (1 - q) * width * dx;
        let tx1 = (x1 - .5 * len * dx) + width * dy;
        let ty1 = (y1 - .5 * len * dy) - width * dx;
        let qx3 = x2 + q * width * dy;
        let qy3 = y2 - q * width * dx;
        let qx4 = (x1 - .75 * len * dx) + (1 - q) * width * dy;
        let qy4 = (y1 - .75 * len * dy) - (1 - q) * width * dx;
        return this.svgjsObject.path(`M${x1},${y1}Q${qx1},${qy1},${qx2},${qy2}T${tx1},${ty1}M${x2},${y2}Q${qx3},${qy3},${qx4},${qy4}T${tx1},${ty1}`)
            .fill('none').stroke({color: '#f06', width: 1}).transform({rotation: -180});
    }

    public renderText(str: string) {
        let text = this.svgjsObject.text((add) => {
            let lines = str.split('\n');
            let next = null;
            let index = 0;
            for (let line of lines) {
                if (next) {
                    next.next = add.tspan(line + ' ').newLine();
                    next = next.next;
                } else {
                    next = add.tspan(line + ' ').newLine();
                }
                next.index = index++;
            }
            add.tspan('make it easy to handle the last line').opacity(0).id("fake").newLine();
        });
        text.on("mouseup", () => {
            this.onTextSelected();
        });
    }

    public onTextSelected() {
        const selectionInfo = View.getSelectionInfo();
        if (selectionInfo !== null) {
            let rect = this.drawRect(selectionInfo);
            this.drawAnnotation('测试', rect, selectionInfo);
        }
    }

    private drawRect(selectionInfo) {
        let rect = this.svgjsObject.rect(selectionInfo.boundingBox.width, selectionInfo.boundingBox.height).fill({
            color: '#f06',
            opacity: 0.25
        }).move(selectionInfo.boundingBox.x, selectionInfo.boundingBox.y);
        let originRect = rect;
        if (selectionInfo.svgInstance.rects) {
            selectionInfo.svgInstance.rects.push(rect);
            (rect as any).bracket = this.bracket(
                selectionInfo.boundingBox.x,
                selectionInfo.boundingBox.y - 10,
                selectionInfo.boundingBox.x + selectionInfo.boundingBox.width,
                selectionInfo.boundingBox.y - 10,
                10);
            (rect as any).moved = selectionInfo.svgInstance.rects[0].moved;
        } else {
            selectionInfo.svgInstance.rects = [rect];
            rect.move(selectionInfo.boundingBox.x, selectionInfo.boundingBox.y + 20.8);
            (rect as any).bracket = this.bracket(
                selectionInfo.boundingBox.x,
                selectionInfo.boundingBox.y - 10 + 20.8,
                selectionInfo.boundingBox.x + selectionInfo.boundingBox.width,
                selectionInfo.boundingBox.y - 10 + 20.8,
                10);
            (rect as any).moved = 0;
            selectionInfo.svgInstance.dy(41.6);
            let next = (selectionInfo.element.parentElement.nextElementSibling as any).instance;
            while (next) {
                if (next.rects) {
                    for (rect of next.rects) {
                        rect.dy(20.8);
                        (rect as any).bracket.dy(-20.8);
                        ++(rect as any).moved;
                        if ((rect as any).annotation) {
                            (rect as any).annotation.dy(20.8);
                        }
                    }
                }
                next = next.next;
            }
        }
        return originRect;
    }

    private drawAnnotation(annotation: string, rect: any, selectionInfo: any) {
        console.log(annotation, rect, selectionInfo);
        rect.annotation = this.svgjsObject.group();
        rect.annotation.rect(30, 17).radius(3, 3)
            .fill({
                color: '#f06',
                opacity: 0.25
            })
            .stroke('#9a003e')
            .move(rect.x() + selectionInfo.boundingBox.width / 2 - 15,
                rect.y() - 27);
        rect.annotation.text(function (add) {
            add.tspan(annotation).newLine()
        }).font({size: 12}).move(rect.x() + selectionInfo.boundingBox.width / 2 - 15 + 3,
            rect.y() - 27 + 1);
    }
}