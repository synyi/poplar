import {Annotator} from "../Annotator/Annotator";
import {DataSource} from "../Annotator/Store/DataSource";
import {Label} from "../Annotator/Store/Label";

class TestDataSource implements DataSource {
    getLabels(): Array<Label> {
        return [
            // new Label('测试', 3, 10),
            // new Label('测试2', 8, 10),
            // new Label('测试3', 9, 11),
            // new Label('测试3', 12, 14),
            // new Label('测试4', 14, 20),
            // new Label('测试5', 16, 20),
        ];
    }


    getRawContent(): string {
        return "01234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789\n" +
            "0123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789\n" +
            "01234567890123456789012345678901234567890123456789\n" +
            "012345678901234567890123456789";
    }
}

let element = document.createElement("div");
document.body.appendChild(element);
let annotator = new Annotator(new TestDataSource(), element);
