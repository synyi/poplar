"use strict";
exports.__esModule = true;
var EventBase = /** @class */ (function () {
    function EventBase() {
        //提供事件处理功能
        this.listeners = {};
    }

    EventBase.prototype.emit = function (event, args) {
        if (!this.listeners[event]) {
            return false;
        }
        for (var _i = 0, _a = this.listeners[event]; _i < _a.length; _i++) {
            var l = _a[_i];
            l.listener(this, args);
            return true;
        }
        return false;
    };
    EventBase.prototype.on = function (event, listener) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        var id = Math.random();
        this.listeners[event].push({listener: listener, id: id});
        return id;
    };
    EventBase.prototype.offById = function (event, id) {
        var list = this.listeners[event];
        for (var i = 0; i < list.length; i++) {
            if (list[i].id == id) {
                list.splice(i, 1);
                return;
            }
        }
    };
    EventBase.prototype.offAll = function () {
        this.listeners = {};
    };
    EventBase.prototype.off = function (event) {
        this.listeners[event] = [];
    };
    return EventBase;
}());
exports.EventBase = EventBase;
