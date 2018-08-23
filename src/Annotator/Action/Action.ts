export namespace Action {
    export interface IAction {
    }

    export namespace Label {
        export class CreateLabelAction implements IAction {
            constructor(public categoryId: number, public startIndex: number, public endIndex: number) {
            }
        }

        export function Create(categoryId: number, startIndex: number, endIndex: number) {
            return new CreateLabelAction(categoryId, startIndex, endIndex);
        }

        export class DeleteLabelAction implements IAction {
            constructor(public id: number) {
            }
        }

        export function Delete(id: number) {
            return new DeleteLabelAction(id);
        }
    }

    export namespace Connection {
        export class CreateConnectionAction implements IAction {
            constructor(public categoryId: number, public fromId: number, public toId: number) {
            }
        }

        export function Create(categoryId: number, fromId: number, toId: number) {
            return new CreateConnectionAction(categoryId, fromId, toId);
        }
    }
}