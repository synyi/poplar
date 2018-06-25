"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({__proto__: []} instanceof Array && function (d, b) {
            d.__proto__ = b;
        }) ||
        function (d, b) {
            for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
        };
    return function (d, b) {
        extendStatics(d, b);

        function __() {
            this.constructor = d;
        }

        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
exports.__esModule = true;
var EventBase_1 = require("../../library/EventBase");
var Connection = /** @class */ (function (_super) {
    __extends(Connection, _super);

    function Connection(from, to, type) {
        var _this = _super.call(this) || this;
        _this.from = from;
        _this.to = to;
        _this.type = type;
        _this.emit("connection_created", _this);
        return _this;
    }

    return Connection;
}(EventBase_1.EventBase));
exports.Connection = Connection;
