/**
 * Created by grzhan on 16/7/1.
 */
/// <reference path="../../../typings/svgjs.d.ts" />
export class Line {
    public svg;
    constructor(id, width, height) {
        this.svg = (SVG as any)(id).size(width, height);
    }

    group() {

    }

    extend(lineNo) {

    }
}
