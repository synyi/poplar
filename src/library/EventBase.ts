export class EventBase {
    //提供事件处理功能
    private listeners = {};

    public emit(event: string, args?: any) {
        if (!this.listeners[event]) {
            return false;
        }
        for (let l of this.listeners[event]) {
            l.listener(this, args);
            return true;
        }
        return false;
    }

    public on(event: string, listener: (target: EventBase, args?: any) => any): number {
        if (!this.listeners[event]) {
            this.listeners[event] = []
        }
        var id = Math.random();
        this.listeners[event].push({listener: listener, id: id});
        return id;
    }

    public offById(event: string, id: number) {
        var list = this.listeners[event];
        for (var i = 0; i < list.length; i++) {
            if (list[i].id == id) {
                list.splice(i, 1);
                return
            }
        }
    }

    public offAll() {
        this.listeners = {}
    }

    private off(event: string) {
        this.listeners[event] = [];
    }
}