// Mixin Decorator
export function Mixin(...mixins) {
    let copy = (target, source) => {
        for (let key of Reflect.ownKeys(source)) {
            if (key !== 'constructor' && key !== 'prototype' && key !== 'name') {
                let desc = Object.getOwnPropertyDescriptor(source, key);
                Object.defineProperty(target, key, desc);
            }
        } 
    };
    
    return function(target) {
        for (let mixin of mixins) {
            copy(target, mixin);
            copy(target.prototype, mixin.prototype);
        }
    }
}