import {TopContextUser} from "./TopContextUser";
import * as SVG from "svg.js";
import {TopContext} from "./TopContext";
import {Label} from "../../Store/Entities/Label";
import {LabelCategory} from "../../Store/Entities/LabelCategory";
import {Base} from "../../Infrastructure/Repository";
import {View} from "../View";

export namespace LabelView {
    const TEXT_CONTAINER_PADDING = 3;
    const TEXT_SIZE = 12;

    export class Entity extends TopContextUser {
        layer: number;
        svgElement: SVG.G = null;
        annotationElement: SVG.G;
        highLightElement: SVG.Rect;
        textElement: SVG.Text = null;
        textWidth: number = null;

        constructor(public readonly id: number,
                    public readonly store: Label.Entity,
                    public readonly context: TopContext) {
            super();
            this.layer = 1;
        }

        get x() {
            return Math.min(this.highlightElementBox.x, this.annotationElementBox.container.x) + 0.5;
        }

        get globalX(): number {
            return (this.annotationElement.children()[0].node.getBoundingClientRect() as DOMRect).x + this.annotationElementBox.container.width / 2;
        }

        get globalY(): number {
            return (this.annotationElement.children()[0].node.getBoundingClientRect() as DOMRect).y + this.textElement.node.clientHeight / 2;
        }

        get width() {
            return Math.max(this.highlightElementBox.width, this.annotationElementBox.container.width) - 1;
        }

        get highlightElementBox() {
            const startIndexInLine = this.store.startIndex - this.context.attachTo.store.startIndex;
            const endIndexInLine = this.store.endIndex - this.context.attachTo.store.startIndex;
            const parent = this.context.attachTo;
            const firstCharX = parent.xCoordinateOfChar[startIndexInLine];
            const endCharX = parent.xCoordinateOfChar[endIndexInLine];
            return {
                x: firstCharX,
                y: parent.y,
                width: endCharX - firstCharX,
                height: 20
            }
        }

        get annotationElementBox() {
            const highlightElementBox = this.highlightElementBox;
            const middleX = highlightElementBox.x + highlightElementBox.width / 2;
            const textX = middleX - this.textWidth / 2;
            return {
                text: {
                    x: textX,
                    width: this.textWidth
                },
                container: {
                    x: textX - TEXT_CONTAINER_PADDING,
                    y: highlightElementBox.y,
                    width: this.textWidth + 2 * TEXT_CONTAINER_PADDING
                }
            }
        }

        private get category(): LabelCategory.Entity {
            return this.store.category;
        }

        /**
         * Thanks to Alex Hornbake (function for generate curly bracket path)
         * @see http://bl.ocks.org/alexhornbake/6005176
         */
        private bracket(x1, y1, x2, y2, width, q = 0.6) {
            //Calculate unit vector
            let dx = x1 - x2;
            let dy = y1 - y2;
            let len = Math.sqrt(dx * dx + dy * dy);
            dx = dx / len;
            dy = dy / len;

            //Calculate Control Points of path,
            let qx1 = x1 + q * width * dy;
            let qy1 = y1 - q * width * dx;
            let qx2 = (x1 - .25 * len * dx) + (1 - q) * width * dy;
            let qy2 = (y1 - .25 * len * dy) - (1 - q) * width * dx;
            let tx1 = (x1 - .5 * len * dx) + width * dy;
            let ty1 = (y1 - .5 * len * dy) - width * dx;
            let qx3 = x2 + q * width * dy;
            let qy3 = y2 - q * width * dx;
            let qx4 = (x1 - .75 * len * dx) + (1 - q) * width * dy;
            let qy4 = (y1 - .75 * len * dy) - (1 - q) * width * dx;
            return this.annotationElement.path(`M${x1},${y1}Q${qx1},${qy1},${qx2},${qy2}T${tx1},${ty1}M${x2},${y2}Q${qx3},${qy3},${qx4},${qy4}T${tx1},${ty1}`)
                .fill('none').stroke({
                    color: this.category.borderColor,
                    width: 1
                });
        }

        initPosition() {
            this.textWidth = this.textElement.node.clientWidth;
        }

        preRender() {
            this.svgElement = this.context.svgElement.group();
            this.annotationElement = this.svgElement.group().back();
            this.textElement = this.annotationElement.text(this.category.text).font({size: TEXT_SIZE});
            // to deceive svg.js not to call bbox when call x() and y()
            // bad for svg.js
            this.svgElement.attr('x', "");
            this.svgElement.attr('y', "");
            this.annotationElement.attr('x', "");
            this.annotationElement.attr('y', "");
            this.textElement.attr('x', "");
            this.textElement.attr('y', "");
        }

        removeElement() {
            this.svgElement.remove();
            this.svgElement = null;
            this.textElement.remove();
            this.textElement = null;
        }

        render() {
            this.renderHighlight();
            this.renderAnnotation();
        }

        private renderHighlight() {
            let box = this.highlightElementBox;
            this.highLightElement = this.svgElement.rect(box.width, box.height);
            this.highLightElement.fill({
                color: this.category.color,
                opacity: 0.5
            }).dx(box.x);
        }

        private renderAnnotation() {
            let highLightBox = this.highlightElementBox;
            let annotationBox = this.annotationElementBox;
            this.annotationElement.rect(annotationBox.container.width, TEXT_SIZE + TEXT_CONTAINER_PADDING * 2)
                .radius(3, 3)
                .fill({
                    color: this.category.color,
                })
                .stroke(this.category.borderColor).back();
            this.annotationElement.x(annotationBox.container.x);
            this.textElement.front();
            this.textElement.x(3).y(-2);
            this.bracket(
                highLightBox.width - (annotationBox.container.x - highLightBox.x), 26,
                0 - (annotationBox.container.x - highLightBox.x), 26,
                8);
            this.textElement.style({
                '-webkit-user-select': 'none',
                '-khtml-user-select': 'none',
                '-moz-user-select': 'none',
                '-ms-user-select': 'none',
                'user-select': 'none',
            });
            this.annotationElement.y(this.y - 5);
            this.annotationElement.style({cursor: 'pointer'});
            this.annotationElement.addClass('label-view');
            this.annotationElement.on('click', (e) => {
                this.context.attachTo.root.root.emit('labelClicked', this.id);
                e.preventDefault();
            });
            this.annotationElement.on('contextmenu', (e) => {
                this.context.attachTo.root.root.emit('labelRightClicked', this.id, e.clientX, e.clientY);
                e.preventDefault();
            });
        }
    }

    export class Repository extends Base.Repository<Entity> {
        root: View;

        constructor(root: View) {
            super(root);
        }

        delete(key: number | Entity): boolean {
            if (typeof key !== "number") {
                key = key.id;
            }
            if (this.has(key)) {
                if (this.has(key))
                    this.get(key).removeElement();
            }
            return super.delete(key);
        }
    }
}