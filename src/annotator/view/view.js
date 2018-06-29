"use strict";
exports.__esModule = true;
var View = /** @class */ (function () {
    function View(svgElement, width, height) {
        this.svgElement = svgElement;
        this.width = width;
        this.height = height;
        this.svgjsObject = SVG(svgElement);
        this.svgjsObject.size(width, height);
    }
    View.getSelectionInfo = function () {
        var selection = window.getSelection();
        var element = selection.baseNode;
        if (element.parentElement.id === 'fake') {
            return null;
        }
        var svgInstance = element.parentElement.instance;
        // 选取的是[startIndex, endIndex)之间的范围
        var startIndex = selection.anchorOffset;
        var endIndex = selection.focusOffset;
        if (startIndex > endIndex) {
            var temp = startIndex;
            startIndex = endIndex;
            endIndex = temp;
        }
        var selectedString = element.textContent;
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
        var firstCharPosition = element.parentElement.getExtentOfChar(startIndex);
        var lastCharPosition = element.parentElement.getExtentOfChar(endIndex);
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
        };
    };
    // Thanks to Alex Hornbake (function for generate curly bracket path)
    // http://bl.ocks.org/alexhornbake/6005176
    View.prototype.bracket = function (x1, y1, x2, y2, width, q) {
        if (q === void 0) { q = 0.6; }
        //Calculate unit vector
        var dx = x1 - x2;
        var dy = y1 - y2;
        var len = Math.sqrt(dx * dx + dy * dy);
        dx = dx / len;
        dy = dy / len;
        //Calculate Control Points of path,
        var qx1 = x1 + q * width * dy;
        var qy1 = y1 - q * width * dx;
        var qx2 = (x1 - .25 * len * dx) + (1 - q) * width * dy;
        var qy2 = (y1 - .25 * len * dy) - (1 - q) * width * dx;
        var tx1 = (x1 - .5 * len * dx) + width * dy;
        var ty1 = (y1 - .5 * len * dy) - width * dx;
        var qx3 = x2 + q * width * dy;
        var qy3 = y2 - q * width * dx;
        var qx4 = (x1 - .75 * len * dx) + (1 - q) * width * dy;
        var qy4 = (y1 - .75 * len * dy) - (1 - q) * width * dx;
        return this.svgjsObject.path("M" + x1 + "," + y1 + "Q" + qx1 + "," + qy1 + "," + qx2 + "," + qy2 + "T" + tx1 + "," + ty1 + "M" + x2 + "," + y2 + "Q" + qx3 + "," + qy3 + "," + qx4 + "," + qy4 + "T" + tx1 + "," + ty1)
            .fill('none').stroke({ color: '#f06', width: 1 }).transform({ rotation: -180 });
    };
    View.prototype.renderText = function (str) {
        var _this = this;
        var text = this.svgjsObject.text(function (add) {
            var lines = str.split('\n');
            var next = null;
            var index = 0;
            for (var _i = 0, lines_1 = lines; _i < lines_1.length; _i++) {
                var line = lines_1[_i];
                if (next) {
                    next.next = add.tspan(line + ' ').newLine();
                    next = next.next;
                }
                else {
                    next = add.tspan(line + ' ').newLine();
                }
                next.index = index++;
            }
            add.tspan('make it easy to handle the last line').opacity(0).id("fake").newLine();
        });
        text.on("mouseup", function () {
            _this.onTextSelected();
        });
    };
    View.prototype.onTextSelected = function () {
        var selectionInfo = View.getSelectionInfo();
        if (selectionInfo !== null) {
            var rect = this.drawRect(selectionInfo);
            this.drawAnnotation('测试', rect, selectionInfo);
        }
    };
    View.prototype.drawRect = function (selectionInfo) {
        var rect = this.svgjsObject.rect(selectionInfo.boundingBox.width, selectionInfo.boundingBox.height).fill({
            color: '#f06',
            opacity: 0.25
        }).move(selectionInfo.boundingBox.x, selectionInfo.boundingBox.y);
        var originRect = rect;
        if (selectionInfo.svgInstance.rects) {
            selectionInfo.svgInstance.rects.push(rect);
            rect.bracket = this.bracket(selectionInfo.boundingBox.x, selectionInfo.boundingBox.y - 10, selectionInfo.boundingBox.x + selectionInfo.boundingBox.width, selectionInfo.boundingBox.y - 10, 10);
            rect.moved = selectionInfo.svgInstance.rects[0].moved;
        }
        else {
            selectionInfo.svgInstance.rects = [rect];
            rect.move(selectionInfo.boundingBox.x, selectionInfo.boundingBox.y + 20.8);
            rect.bracket = this.bracket(selectionInfo.boundingBox.x, selectionInfo.boundingBox.y - 10 + 20.8, selectionInfo.boundingBox.x + selectionInfo.boundingBox.width, selectionInfo.boundingBox.y - 10 + 20.8, 10);
            rect.moved = 0;
            selectionInfo.svgInstance.dy(41.6);
            var next = selectionInfo.element.parentElement.nextElementSibling.instance;
            while (next) {
                if (next.rects) {
                    for (var _i = 0, _a = next.rects; _i < _a.length; _i++) {
                        rect = _a[_i];
                        rect.dy(20.8);
                        rect.bracket.dy(-20.8);
                        ++rect.moved;
                        if (rect.annotation) {
                            rect.annotation.dy(20.8);
                        }
                    }
                }
                next = next.next;
            }
        }
        return originRect;
    };
    View.prototype.drawAnnotation = function (annotation, rect, selectionInfo) {
        console.log(annotation, rect, selectionInfo);
        rect.annotation = this.svgjsObject.group();
        rect.annotation.rect(30, 17).radius(3, 3)
            .fill({
            color: '#f06',
            opacity: 0.25
        })
            .stroke('#9a003e')
            .move(rect.x() + selectionInfo.boundingBox.width / 2 - 15, rect.y() - 27);
        rect.annotation.text(function (add) {
            add.tspan(annotation).newLine();
        }).font({ size: 12 }).move(rect.x() + selectionInfo.boundingBox.width / 2 - 15 + 3, rect.y() - 27 + 1);
    };
    return View;
}());
exports.View = View;
