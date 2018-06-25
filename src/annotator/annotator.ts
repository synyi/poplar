import {Paragraph} from './model/paragraph'
import {Controller} from './controller/controller'
import {EventBase} from "../library/EventBase";
import {View} from "./view/view";

const testText = "asfd asfasdf asdfsad asfd asdfasdf asfsad asfasdf asdfdasf asfddasf asfasdf asdffasd asdf sadfasd kimqw afdoij afasdf\n" +
    "asdf asdfmjjas asdjojoa nxncnninwo ojojadnoj asdjopjasd ioajdji oajfj jaopj[ ajoj asdjfo iojapsdjf oajisfdojm asfdjoiasfd asdofjoi asdfj\n" +
    "ojasdfjjas japosifjrpoj jdepjfhq qhufqofh afjphsdafqipnv qhcqihfh qwefhuqnh qfh qfh qhfhuqwiefhi qwefhhqwef qwfheiuhqwif qwefhiuhqif qihwfih\n" +
    "ojasdfjjas japosifjrpoj jdepjfhq qhufqofh afjphsdafqipnv qhcqihfh qwefhuqnh qfh qfh qhfhuqwiefhi qwefhhqwef qwfheiuhqwif qwefhiuhqif qihwfih\n";

export class Annotator extends EventBase implements Controller {
    private view: View;
    private model: Paragraph;

    constructor(
        private svgElement: HTMLElement
    ) {
        super();
        this.view = new View(svgElement, 1024, 768);
        this.view.renderText(testText);
    }

    onParagraphContentChanged(): void {
    }

    onTextSelect(): void {
    }
}