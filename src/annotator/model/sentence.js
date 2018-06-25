"use strict";
exports.__esModule = true;
var Sentence = /** @class */ (function () {
    function Sentence() {
    }

    Sentence.prototype.onCreateLabel = function (word) {
        this.labels.push(word);
    };
    Sentence.prototype.slice = function (startIndex, endIndex) {
        return this.content.slice(startIndex, endIndex);
    };
    return Sentence;
}());
exports.Sentence = Sentence;
