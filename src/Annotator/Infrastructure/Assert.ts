declare let process: any;

export function assert(condition: Boolean, message?: string) {
    if (process.env.NODE_ENV === 'development') {
        if (condition === false) {
            throw Error('Assertion failed' + message ? ':' + message : '')
        }
    }
}