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
var EventBase_1 = require("../library/EventBase");
var view_1 = require("./view/view");
var testText = "asfd asfasdf asdfsad asfd asdfasdf asfsad asfasdf asdfdasf asfddasf asfasdf asdffasd asdf sadfasd kimqw afdoij afasdf\n" +
    "asdf asdfmjjas asdjojoa nxncnninwo ojojadnoj asdjopjasd ioajdji oajfj jaopj[ ajoj asdjfo iojapsdjf oajisfdojm asfdjoiasfd asdofjoi asdfj\n" +
    "ojasdfjjas japosifjrpoj jdepjfhq qhufqofh afjphsdafqipnv qhcqihfh qwefhuqnh qfh qfh qhfhuqwiefhi qwefhhqwef qwfheiuhqwif qwefhiuhqif qihwfih\n" +
    "ojasdfjjas japosifjrpoj jdepjfhq qhufqofh afjphsdafqipnv qhcqihfh qwefhuqnh qfh qfh qhfhuqwiefhi qwefhhqwef qwfheiuhqwif qwefhiuhqif qihwfih\n";
var Annotator = /** @class */ (function (_super) {
    __extends(Annotator, _super);

    function Annotator(svgElement) {
        var _this = _super.call(this) || this;
        _this.svgElement = svgElement;
        _this.view = new view_1.View(svgElement, 1024, 768);
        _this.view.renderText(testText);
        return _this;
    }

    Annotator.prototype.onParagraphContentChanged = function () {
    };
    Annotator.prototype.onTextSelect = function () {
    };
    return Annotator;
}(EventBase_1.EventBase));
exports.Annotator = Annotator;
