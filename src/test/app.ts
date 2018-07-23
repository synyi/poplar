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
        return "123456789022345678903234567890423456789052345678901234567890223456789032345678904234567890523456789012345678902234567890323456789042345678905234567890123456789022345678903234567890423456789052345678901234567890223456789032345678904234567890523456789012345678902234567890323456789042345678905234567890\n" +
            "623456789072345678908234567890\n9234567890";
    }
}

let element = document.createElement("div");
document.body.appendChild(element);
let annotator = new Annotator(new TestDataSource(), element);
