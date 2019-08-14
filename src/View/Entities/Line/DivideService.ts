import {View} from "../../View";
import {none, Option, some} from "../../../Infrastructure/Option";
import {Line} from "./Line";

interface Token {
    readonly startIndex: number;
    readonly endIndex: number;
}

/**
 * warning: this class is tricky!
 * do NOT touch unless you're sure!
 * todo: more test!
 * todo: handle cross-label \n
 */
export class LineDivideService {
    // "word" is kept in one token
    //                                 English word                   number
    //                          vvvvvvvvvvvvvvvvvvvvvvvvvvvv   vvvvvvvvvvvvvvvvvvvv
    static readonly wordReg = /([a-zA-z][a-zA-Z0-9'’]*[-|.]?)|([+\-]?[0-9.][0-9.%]*)/g;
    private result: Array<Line.Entity>;
    private tokenQueue: Array<Token>;

    constructor(private view: View) {
    }

    get store() {
        return this.view.store;
    }

    public divide(startIndex: number, endIndex: number): Array<Line.Entity> {
        this.init();
        let currentTokenStart = startIndex;
        let currentTokenEnd = startIndex + 1;
        do {
            let tokenEndAfterLabelMerged = this.mergeLabel(currentTokenEnd);
            let tokenEndAfterWordsMerged = this.mergeWord(tokenEndAfterLabelMerged);
            const noMergePerformed = tokenEndAfterLabelMerged === currentTokenEnd && tokenEndAfterLabelMerged === tokenEndAfterWordsMerged;
            if (this.store.content[currentTokenEnd - 1] === '\n') {
                this.reduce(this.tokenQueue[0].startIndex, currentTokenEnd);
                currentTokenStart = currentTokenEnd;
            } else if (noMergePerformed) {
                this.shiftWithAutoReduce({startIndex: currentTokenStart, endIndex: currentTokenEnd});
                currentTokenStart = currentTokenEnd;
            }
            ++currentTokenEnd;
        } while (currentTokenStart < endIndex);
        let last: Option<Line.Entity> = none;
        for (let line of this.result) {
            last.map(it => it.next = some(line));
            line.last = last;
            last = some(line);
        }
        return this.result;
    }

    // while currentToken ends in a label
    // merge the label into the token
    //          0123456789
    // token    [ ])
    // label      [   ])

    private init() {
        this.result = [];
        this.tokenQueue = [];
    }

    // while currentToken ends in a word
    // merge the word into the token
    //          0123456789
    // token    [ ])
    // word       [])

    // out      [     ])
    private mergeLabel(currentTokenEnd: number): number {
        if (this.store.labelRepo.getEntitiesCross(currentTokenEnd - 1)
            .some(it => it.endIndex > currentTokenEnd)) {
            return this.store.labelRepo.getEntitiesCross(currentTokenEnd - 1)
                .filter(it => it.endIndex > currentTokenEnd)
                .sort((a, b) => b.endIndex - a.endIndex)[0]
                .endIndex;
        }
        return currentTokenEnd;
    };

    // out      [  ])
    private mergeWord(currentTokenEnd: number): number {
        // part of a word is still a word
        LineDivideService.wordReg.lastIndex = 0;
        const nextWordRegTestResult = LineDivideService.wordReg.exec(this.store.contentSlice(currentTokenEnd - 1, currentTokenEnd + 1));
        if (nextWordRegTestResult === null) {
            return currentTokenEnd;
        }
        if (nextWordRegTestResult[0].length === 2) {
            return currentTokenEnd + 1;
        }
        return currentTokenEnd;
    };

    private reduce(startIndex: number, endIndex: number) {
        const newEntity = new Line.Entity(startIndex, endIndex, none, none, this.view);
        this.result.push(newEntity);
        this.tokenQueue = [];
    }

    private shiftWithAutoReduce(token: Token) {
        const currentQueueWidth = this.tokenQueue.length === 0 ? 0 : this.view.contentWidth(this.tokenQueue[0].startIndex, this.tokenQueue[this.tokenQueue.length - 1].endIndex);
        const currentTokenWidth = this.view.contentWidth(token.startIndex, token.endIndex);
        if (this.tokenQueue.length !== 0 && currentQueueWidth + currentTokenWidth > this.view.lineMaxWidth) {
            this.reduce(this.tokenQueue[0].startIndex, this.tokenQueue[this.tokenQueue.length - 1].endIndex);
        }
        if (currentTokenWidth > this.view.lineMaxWidth) {
            this.reduce(token.startIndex, token.endIndex);
            console.warn(`the token "${this.store.contentSlice(token.startIndex, token.endIndex)}" is too long for a line!`);
        } else {
            this.tokenQueue.push(token);
        }
    }
}
