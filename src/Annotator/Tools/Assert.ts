export function assert(condition: Boolean) {
    if (!condition) {
        throw Error("Assertion failed");
    }
}