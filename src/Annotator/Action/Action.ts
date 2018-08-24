// ts cannot merge namespace in different modules
// or, I don't know how to do it
// TAT
// After all, since we don't have many things here
// so one file is enough

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

        export class UpdateLabelAction implements IAction {
            constructor(public labelId: number, public categoryId: number) {
            }
        }

        export function Update(labelId: number, categoryId: number) {
            return new UpdateLabelAction(labelId, categoryId);
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

        export class DeleteConnectionAction implements IAction {
            constructor(public id: number) {
            }
        }

        export function Delete(id: number) {
            return new DeleteConnectionAction(id);
        }


        export class UpdateConnectionAction implements IAction {
            constructor(public connectionId: number, public categoryId: number) {
            }
        }

        export function Update(connectionId: number, categoryId: number) {
            return new UpdateConnectionAction(connectionId, categoryId);
        }
    }
}