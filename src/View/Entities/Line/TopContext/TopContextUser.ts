export abstract class TopContextUser {
    readonly left!: number;
    readonly width!: number;
    layer: number = 0;

    abstract render(): SVGElement;

    abstract update(): void;
}

export function overLaps(user1: TopContextUser, user2: TopContextUser): boolean {
    if (user1.layer !== user2.layer) {
        return false;
    } else if (user1.left > user2.left) {
        return overLaps(user2, user1);
    } else if (user1.left + user1.width < user2.left) {
        return false;
    }
    return true;
}
