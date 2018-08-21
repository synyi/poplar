// import {Connection} from "../../Store/Entities/Connection";
// import {View} from "../View";
// import {TopContextUser} from "./TopContext";
// import * as SVG from "svg.js";
//
// export namespace ConnectionView {
//     export class Entity extends TopContextUser {
//         svgElement: SVG.G;
//         textElement: SVG.Text = null;
//         layer: number;
//
//         constructor(
//             public readonly id: number,
//             public readonly store: Connection.Entity
//         ) {
//             super();
//         }
//
//         delete() {
//             this.svgElement.remove();
//             this.textElement = null;
//         }
//
//
//         render() {
//             if (this.textElement === null) {
//                 // this.textElement = this.root.svgDoc.text(this.category.text);
//             }
//             this.svgElement.add(this.textElement);
//             this.svgElement.x(this.x);
//             this.svgElement.y(this.y);
//         }
//
//
//         get context() {
//             return this.root.labelViewRepo.get(this.firstLabelId).context;
//         }
//
//         get from() {
//             return this.root.labelViewRepo.get(this.store.fromId);
//         }
//
//         get to() {
//             return this.root.labelViewRepo.get(this.store.toId);
//         }
//
//         get category() {
//             return this.root.store.connectionCategoryRepo.get(this.store.categoryId);
//         }
//
//         get width(): number {
//             if (this.textElement === null) {
//                 this.textElement = this.root.svgDoc.text(this.category.text);
//             }
//             return this.textElement.bbox().width;
//         }
//
//         get x(): number {
//             return (this.from.x + this.to.x) / 2;
//         }
//     }
// }