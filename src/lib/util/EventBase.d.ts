export declare class EventBase {
    private listeners;
    emit(event: string, args?: any): boolean;
    on(event: string, listener: (target: EventBase, args?: any) => any): number;
    private off(event);
    offById(event: string, id: number): void;
    offAll(): void;
}
