export class EventBase {
    //提供事件处理功能
    static listeners = {};

    static on(event: string, listener: (target: EventBase, args?: any) => any): number {
        if (!EventBase.listeners[event]) {
            EventBase.listeners[event] = []
        }
        const id = Math.random();
        EventBase.listeners[event].push({listener: listener, id: id});
        return id;
    }

    static offById(event: string, id: number) {
        const list = EventBase.listeners[event];
        for (let i = 0; i < list.length; i++) {
            if (list[i].id == id) {
                list.splice(i, 1);
                return;
            }
        }
    }

    static offAll() {
        EventBase.listeners = {}
    }

    private static off(event: string) {
        EventBase.listeners[event] = [];
    }

    public emit(event: string, args?: any) {
        if (!EventBase.listeners[event]) {
            return false;
        }
        for (let l of EventBase.listeners[event]) {
            l.listener(this, args);
        }
    }
}