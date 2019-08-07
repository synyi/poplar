//                                  top        ___________________
//        /\                                    |               |
//       /  \                                   |               |
//      /____\                             topToBaseLine        |
//     /      \     \   /                       |            fontSize
//    /        \     \ /          baseLine     _|_              |
//                    /                                         |
//                   /             bottom      _________________|_
//    |--textWidth--|  |textWidth|
export class Font {
    readonly fontSize: number;
    // it's really sad that in svg 1.1, I cannot set <text> in svg's
    // line-height directly to 100%, which can make
    // fontSize === lineHeight forever
    // which makes lineHeight necessary
    // and <text> in svg is fixed to box-sizing: content-box;
    readonly lineHeight: number;
    // when render with dy=0
    // <text>'s **baseline**'s y is 0
    // for making <text>'s topY=0
    // topToBaseLine distance is necessary
    readonly topToBaseLine: number;
    readonly width: Map<string, number>;

    constructor(
        characters: string,
        testRenderElement: SVGTSpanElement,
        baseLineReferenceElement: SVGRectElement
    ) {
        this.width = new Map();
        const characterSet = new Set(characters);
        characterSet.delete('\n');
        const characterArray = Array.from(characterSet);
        testRenderElement.innerHTML = characterArray.join('');
        testRenderElement.parentNode.parentNode.insertBefore(baseLineReferenceElement, testRenderElement.parentNode);
        characterArray.forEach((ch: string, index: number) => {
            this.width.set(ch, testRenderElement.getExtentOfChar(index).width);
        });
        this.topToBaseLine = baseLineReferenceElement.getBoundingClientRect().top - testRenderElement.getBoundingClientRect().top;
        this.fontSize = parseFloat(window.getComputedStyle(testRenderElement).fontSize);
        this.lineHeight = testRenderElement.getBoundingClientRect().height;
    }

    widthOf(text: Array<string> | string): number {
        if (typeof text === "string") {
            return this.widthOf(Array.from(text));
        } else {
            return text.map(it => this.width.get(it))
                .reduce((a: number, b: number) => a + b, 0)
        }
    }
}
