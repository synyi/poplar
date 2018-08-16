import {EventEmitter} from 'events';

export class Annotator extends EventEmitter {
    static instance: Annotator;

    constructor(data: string, htmlElement: HTMLElement, public config: object) {
        super();
        this.store = new Store(data);
        this.view = new View(htmlElement);
        this.view.render();
    }
}