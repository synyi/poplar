declare let process: any;

export function assert(condition: boolean, message?: string) {
    if (process.env.NODE_ENV === 'development') {
        if (condition === false) {
            throw Error('Assertion failed' + (message == undefined) ? (':' + message) : '')
        }
    }
}
