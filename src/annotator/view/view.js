"use strict";
exports.__esModule = true;
var Root_1 = require("./Elements/Root");
var View = /** @class */ (function () {
    function View(store, svgElement, width, height) {
        this.store = store;
        this.svgElement = svgElement;
        this.width = width;
        this.height = height;
        this.svgDoc = SVG(svgElement);
        svgElement.svgInstance = this.svgDoc;
        this.svgDoc.size(width, height);
        this.root = new Root_1.Root(store);
        this.root.render(this.svgDoc);
    }
    return View;
}());
exports.View = View;
