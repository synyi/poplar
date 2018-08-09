export function assert(condition: Boolean, message?: string) {
    if (!condition) {
        throw Error("Assertion failed:" + message);
    }
}