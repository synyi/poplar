"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
exports.__esModule = true;
var EventBase_1 = require("../../library/EventBase");
var Root_1 = require("./Elements/Root");
var View = /** @class */ (function (_super) {
    __extends(View, _super);
    function View(store, svgElement, width, height) {
        var _this = _super.call(this) || this;
        _this.store = store;
        _this.svgElement = svgElement;
        _this.width = width;
        _this.height = height;
        _this.svgDoc = SVG(svgElement);
        _this.svgDoc.size(width, height);
        _this.root = new Root_1.Root(store);
        _this.root.render(_this.svgDoc);
        return _this;
    }
    return View;
}(EventBase_1.EventBase));
exports.View = View;
