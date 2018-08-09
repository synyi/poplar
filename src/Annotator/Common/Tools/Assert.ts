export function assert(condition: boolean, message?: string) {
    if (!condition) {
        throw Error("Assertion failed:" + message);
    }
}