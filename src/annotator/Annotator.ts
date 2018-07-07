import {View} from "./view/view";
import {Store} from "./Store/Store";
import {AnnotatorDataSource} from "./Store/AnnotatorDataSource";
import {Dispatcher} from "./Dispatcher/Dispatcher";
import {AddLabelAction} from "./Action/AddLabel";
import {ConnectLabelAction} from "./Action/ConnectLabel";

const testText = "asfd asfasdf asdfsad asfd asdfasdf asfsad asfasdf asdfdasf asfddasf asfasdf asdffasd asdf sadfasd kimqw afdoij afasdf\n" +
    "asdf asdfmjjas asdjojoa nxncnninwo ojojadnoj asdjopjasd ioajdji oajfj jaopj[ ajoj asdjfo iojapsdjf oajisfdojm asfdjoiasfd asdofjoi asdfj\n" +
    "ojasdfjjas japosifjrpoj jdepjfhq qhufqofh afjphsdafqipnv qhcqihfh qwefhuqnh qfh qfh qhfhuqwiefhi qwefhhqwef qwfheiuhqwif qwefhiuhqif qihwfih\n" +
    "ojasdfjjas japosifjrpoj jdepjfhq qhufqofh afjphsdafqipnv qhcqihfh qwefhuqnh qfh qfh qhfhuqwiefhi qwefhhqwef qwfheiuhqwif qwefhiuhqif qihwfih\n";

export class Annotator {
    private view: View;
    private store: Store;

    constructor(
        dataSource: AnnotatorDataSource,
        private svgElement: HTMLElement
    ) {
        this.store = new Store(dataSource);
        this.view = new View(this.store, svgElement, 1500, 768);
        Dispatcher.register('AddLabelAction', (action: AddLabelAction) => {
            this.store.addLabel(action.text, action.startIndex, action.endIndex);
        });
        Dispatcher.register('ConnectLabelAction', (action: ConnectLabelAction) => {
            this.store.connectLabel(action.text, action.labelFrom, action.labelTo);
        });
    }

}