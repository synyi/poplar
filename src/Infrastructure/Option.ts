export class Option<T> {
    constructor(private value: T | null) {
    }

    get isSome(): boolean {
        return this.value !== null;
    }

    map<U>(func: (from: T) => U) {
        if (this.value === null) {
            return new Option<U>(null);
        } else {
            return new Option(func(this.value));
        }
    }

    flatMap<U>(func: (from: T) => Option<U>) {
        if (this.value === null) {
            return new Option<U>(null);
        } else {
            return fromNullable(func(this.value).toNullable());
        }
    }

    orElse(defaultValue: T): T {
        return this.value === null ? defaultValue : this.value;
    }

    toNullable(): T | null {
        return this.value;
    }

    match<U>(whenSome: U, whenNone: U): U {
        if (this.isSome) {
            return whenSome;
        } else {
            return whenNone;
        }
    }
}

export const none = new Option(null as any);

export function some<T>(value: T): Option<T> {
    return new Option(value);
}

export function fromNullable<T>(value: T | undefined | null): Option<T> {
    if (value === null || value === undefined) {
        return none;
    } else {
        return some(value);
    }
}

export function fromTry<T>(value: () => T): Option<T> {
    try {
        const result = value();
        return some(result);
    } catch (e) {
        return none;
    }
}

