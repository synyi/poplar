export namespace Action {
    export interface IAction {
    }

    export namespace Label {
        export class CreateLabelAction implements IAction {
            constructor(public categoryId: number, public startIndex, public endIndex) {
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
}