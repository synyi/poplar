import 'mocha';
import {launch, Page} from 'puppeteer';
import {expect} from 'chai';

async function selectText(page: Page, lineIndex: number, startCharacterIndex: number, selectLength: number) {
    let selection = await page.evaluate((lineIndex: number, startCharacterIndex: number, selectLength: number) => {
        let clientRect = document.querySelector("svg").getClientRects()[0];
        let theLine = document.querySelectorAll(".poplar-annotation-content > tspan")[lineIndex] as SVGTSpanElement;
        let startCharacterRect = theLine.getExtentOfChar(startCharacterIndex);
        let endCharacterRect = theLine.getExtentOfChar(startCharacterIndex + selectLength);
        return {
            fromX: startCharacterRect.x + clientRect.left,
            fromY: startCharacterRect.y + clientRect.top + 10,
            toX: endCharacterRect.x + clientRect.left,
            toY: endCharacterRect.y + clientRect.top + 10,
        };
    }, lineIndex, startCharacterIndex, selectLength);
    await page.mouse.move(selection.fromX + 1, selection.fromY);
    await page.mouse.down();
    await page.mouse.move(selection.toX, selection.toY);
    await page.mouse.up();
}

async function changeCursorPosition(page: Page, lineIndex: number, beforeCharacterIndex: number) {
    let selection = await page.evaluate((lineIndex: number, beforeCharacterIndex: number) => {
        let clientRect = document.querySelector("svg").getClientRects()[0];
        let theLine = document.querySelectorAll(".poplar-annotation-content > tspan")[lineIndex] as SVGTSpanElement;
        let beforeCharacterRect = theLine.getExtentOfChar(beforeCharacterIndex);
        return {
            x: beforeCharacterRect.x + clientRect.left,
            y: beforeCharacterRect.y + clientRect.top + 18
        }
    }, lineIndex, beforeCharacterIndex);
    await page.mouse.click(selection.x, selection.y);
}

async function checkSVGElementSize(page: Page): Promise<boolean> {
    return await page.evaluate(() => {
        let svgRect = document.getElementsByTagName("svg")[0].getBoundingClientRect();
        let textRect = document.querySelector("text.poplar-annotation-content").getBoundingClientRect();
        return textRect.bottom + 1 <= svgRect.bottom;
    });
}

async function countElement(page: Page, selector: string) {
    return await page.evaluate((selector: string) => {
        return document.querySelectorAll(selector).length;
    }, selector);
}

async function countLabels(page: Page) {
    return await countElement(page, ".poplar-annotation-label");
}

async function countConnections(page: Page) {
    return await countElement(page, ".poplar-annotation-connection");
}

async function getContent(page: Page) {
    return await page.evaluate(() => (window as any).annotator.store.content);
}

describe('e2e test', function () {
    this.timeout(60000);
    it('can add label', async () => {
        const browser = await launch({args: ['--no-sandbox']});
        const page = await browser.newPage();
        await page.goto('http://localhost:8080');
        expect(await countLabels(page)).eq(2);
        expect(await checkSVGElementSize(page)).true;

        await selectText(page, 0, 5, 2);
        expect(await countLabels(page)).eq(3);
        expect(await checkSVGElementSize(page)).true;

        await selectText(page, 0, 0, 4);
        expect(await countLabels(page)).eq(4);
        expect(await checkSVGElementSize(page)).true;
        await browser.close();
    });
    it('can remove label', async () => {
        const browser = await launch({args: ['--no-sandbox']});
        const page = await browser.newPage();
        await page.goto('http://localhost:8080');
        expect(await countLabels(page)).eq(2);
        expect(await checkSVGElementSize(page)).true;

        await page.click(".poplar-annotation-label", {button: "right"});
        expect(await countLabels(page)).eq(1);
        expect(await checkSVGElementSize(page)).true;
        await browser.close();
    });
    it('can add connection', async () => {
        const browser = await launch({args: ['--no-sandbox']});
        const page = await browser.newPage();
        await page.goto('http://localhost:8080');
        expect(await countConnections(page)).eq(1);
        await selectText(page, 0, 5, 2);
        await page.evaluate(() => {
            let labelTexts = document.querySelectorAll("svg > g > g .poplar-annotation-label");
            labelTexts[0].classList.add("click-1");
            labelTexts[2].classList.add("click-2");
        });
        expect(await checkSVGElementSize(page)).true;
        await page.click('.click-1');
        await page.click('.click-2');
        expect(await countConnections(page)).eq(2);
        expect(await checkSVGElementSize(page)).true;
    });
    it('can remove connection', async () => {
        const browser = await launch({args: ['--no-sandbox']});
        const page = await browser.newPage();
        await page.goto('http://localhost:8080');
        expect(await countConnections(page)).eq(1);
        await page.click(".poplar-annotation-connection", {button: "right"});
        expect(await countConnections(page)).eq(0);
        expect(await checkSVGElementSize(page)).true;
    });
    it('can insert text', async () => {
        const browser = await launch({args: ['--no-sandbox']});
        const page = await browser.newPage();
        await page.goto('http://localhost:8080');
        await changeCursorPosition(page, 2, 1);
        await page.keyboard.type(" an input ");
        let content = (await getContent(page)).split('\n')[2].slice(2, 10);
        expect(content).eq("an input");
        await changeCursorPosition(page, 1, 0);
        await page.keyboard.type("qwerty");
        content = (await getContent(page)).split('\n')[1];
        expect(content).eq("qwerty");
        expect(await checkSVGElementSize(page)).true;
        await browser.close()
    });
    it('can remove text', async () => {
        const browser = await launch({args: ['--no-sandbox']});
        const page = await browser.newPage();
        await page.goto('http://localhost:8080');
        await changeCursorPosition(page, 1, 0);
        await page.keyboard.press("Enter");
        await page.keyboard.press("Enter");
        let lineCount = await page.evaluate(() => (window as any).annotator.store.content.split('\n').length);
        expect(lineCount).eq(6);
        await page.keyboard.press("ArrowUp");
        await page.keyboard.type("hello?");
        await page.keyboard.press("ArrowUp");
        await page.keyboard.press("Backspace");
        lineCount = await page.evaluate(() => (window as any).annotator.store.content.split('\n').length);
        const lineViewCount = await page.evaluate(() => document.getElementsByTagName("tspan").length);
        expect(lineCount).eq(lineViewCount);
        expect(lineCount).lte(5);
        expect(lineCount).gte(4);
        expect(await countLabels(page)).eq(2);
        await browser.close();
    });
    it('should not remove text in label', async () => {
        const browser = await launch({args: ['--no-sandbox']});
        const page = await browser.newPage();
        await page.goto('http://localhost:8080');
        expect(await countLabels(page)).eq(2);
        await changeCursorPosition(page, 0, 2);
        await page.keyboard.press("Backspace");
        expect(await countLabels(page)).eq(2);
        let content = (await getContent(page)).split('\n')[0];
        expect(content).contains("测试文本");
        await browser.close();
    });
});
