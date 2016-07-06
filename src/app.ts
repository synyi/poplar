/// <reference path="svgjs/svgjs.d.ts" />
import {Annotator, Categories} from './lib/Annotator';
let annotator = new Annotator('drawing', 2000, 2500);

// Init.
let raw = '首次病程记录\n肺部感染\n患者???，男,64岁因“发热咳嗽咳痰3天”入院\n发热咳嗽咳痰3天\n头颅无畸形，直径约2.0mm，鼻无畸形\n无异常分泌物\n口唇微绀，\n浅表淋巴结未及肿大\n双侧呼吸运动对称，双侧语颤对称，双肺叩清音，右下肺闻及上饶市人民医院姓名：郑礼金科别：呼吸科床号：045住院号：0000177湿罗音\n心尖搏动位于左锁骨中线第五肋间内0.5cm，搏动有力，心界无扩大，心率：89次/分，未闻及杂音\n脊柱呈生理弯曲，无压痛及叩痛，四肢关节无畸形，活动自如，\n双侧甲状腺不大，\n外院胸部X线：右下肺感染\n37.3℃21次/分126/50mmHg正常面容表情自然步态正常言语清楚全身皮肤、粘膜无皮疹\n胸廓无畸形，右下肺闻及湿罗音\n周围性血管征阴性\n腹部平软，右下腹麦氏点无压痛，无反跳痛及肌紧张\n3次/分，无亢进或减退\n患者自诉三天前无明显诱因的出现发热，体温最高达40.5℃，热型不祥，伴畏寒无盗汗，后出现咳嗽咳痰，呈非刺激性咳嗽，白色粘液痰，量少，不易咳出，无头痛、头晕、咽痛、胸痛、心悸、心前区疼痛、腹痛、腹胀、腹泻、尿频、尿急、尿痛等症状\n在门诊行胸部X线示：故为求进一步诊治于今日入我科住院治疗，本次起病，精神、食纳、睡眠稍差，\n1、诊断方面：1）：血常规，痰培养，血沉，结核抗体等\n2）：胸部CT，心电图等\n2、治疗方面：卧床休息\n给予抗炎、化痰等综合治疗\n3、待检查结果出来后再行进一步诊治\n1、肺结核：肺结核多有全身中毒症状，如午后低热、盗汗、疲乏无力，体重减轻、失眠、心悸\nX线胸片见病变多在肺尖或锁骨上下，密度不均，消散缓慢，且有形成空洞或肺内播散\n一般抗菌治疗无效\n2、肺癌：多无急性感染症状，有时痰中带血丝\n白细胞计数不高，痰中发现癌细胞可以确诊\n肺癌可伴有阻塞性肺炎，经抗炎治疗后炎症消退，肿瘤阴影渐趋明显，或减肺门淋巴结肿大，有时出现肺不张\n对吸烟及年龄的患者，必要时行CT、MRI、纤维支气管镜和痰脱落细胞检查等\n3、急性肺脓肿：早期临床表现与肺炎链球菌肺炎相似\n但随病程进展，咳出大量脓臭痰为肺脓肿特征\nX线显示脓腔及气液平，易与肺炎鉴别\nremovedtotalphasesis107totalphaseis222';


let labels = {
    "concepts": [{
        "meta": {
            "category": "diagnosis",
            "text": "\u80ba\u90e8\u611f\u67d3",
            "id": 0,
            "start_index": 7,
            "end_index": 11
        }, "relations": []
    }, {
        "meta": {"category": "sign&symptom", "text": "\u53d1\u70ed", "id": 1, "start_index": 25, "end_index": 27},
        "relations": []
    }, {
        "meta": {"category": "sign&symptom", "text": "\u54b3\u55fd", "id": 2, "start_index": 27, "end_index": 29},
        "relations": []
    }, {
        "meta": {"category": "sign&symptom", "text": "\u54b3\u75f0", "id": 3, "start_index": 29, "end_index": 31},
        "relations": []
    }, {
        "meta": {"category": "sign&symptom", "text": "\u53d1\u70ed", "id": 4, "start_index": 37, "end_index": 39},
        "relations": []
    }, {
        "meta": {"category": "sign&symptom", "text": "\u54b3\u55fd", "id": 5, "start_index": 39, "end_index": 41},
        "relations": []
    }, {
        "meta": {"category": "sign&symptom", "text": "\u54b3\u75f0", "id": 6, "start_index": 41, "end_index": 43},
        "relations": []
    }, {
        "meta": {
            "category": "sign&symptom",
            "text": "\u6e7f\u7f57\u97f3",
            "id": 7,
            "start_index": 152,
            "end_index": 155
        },
        "relations": []
    }, {
        "meta": {"category": "sign&symptom", "text": "\u538b\u75db", "id": 8, "start_index": 213, "end_index": 215},
        "relations": [{"category": "negation", "text": "\u65e0", "start_index": 212, "end_index": 213}]
    }, {
        "meta": {"category": "sign&symptom", "text": "\u53e9\u75db", "id": 9, "start_index": 216, "end_index": 218},
        "relations": []
    }, {
        "meta": {"category": "assessment", "text": "X\u7ebf", "id": 10, "start_index": 246, "end_index": 248},
        "relations": []
    }, {
        "meta": {"category": "sign&symptom", "text": "\u53d1\u70ed", "id": 11, "start_index": 377, "end_index": 379},
        "relations": []
    }, {
        "meta": {"category": "sign&symptom", "text": "\u754f\u5bd2", "id": 12, "start_index": 397, "end_index": 399},
        "relations": [{"category": "negation", "text": "\u65e0", "start_index": 399, "end_index": 400}]
    }, {
        "meta": {"category": "sign&symptom", "text": "\u76d7\u6c57", "id": 13, "start_index": 400, "end_index": 402},
        "relations": [{"category": "negation", "text": "\u65e0", "start_index": 399, "end_index": 400}]
    }, {
        "meta": {"category": "sign&symptom", "text": "\u54b3\u55fd", "id": 14, "start_index": 406, "end_index": 408},
        "relations": []
    }, {
        "meta": {"category": "sign&symptom", "text": "\u54b3\u75f0", "id": 15, "start_index": 408, "end_index": 410},
        "relations": []
    }, {
        "meta": {"category": "sign&symptom", "text": "\u54b3\u55fd", "id": 16, "start_index": 416, "end_index": 418},
        "relations": []
    }, {
        "meta": {
            "category": "sign&symptom",
            "text": "\u767d\u8272\u7c98\u6db2\u75f0",
            "id": 17,
            "start_index": 419,
            "end_index": 424
        }, "relations": []
    }, {
        "meta": {"category": "sign&symptom", "text": "\u5934\u75db", "id": 18, "start_index": 434, "end_index": 436},
        "relations": [{"category": "negation", "text": "\u65e0", "start_index": 433, "end_index": 434}]
    }, {
        "meta": {"category": "sign&symptom", "text": "\u5934\u6655", "id": 19, "start_index": 437, "end_index": 439},
        "relations": []
    }, {
        "meta": {"category": "sign&symptom", "text": "\u54bd\u75db", "id": 20, "start_index": 440, "end_index": 442},
        "relations": []
    }, {
        "meta": {"category": "sign&symptom", "text": "\u80f8\u75db", "id": 21, "start_index": 443, "end_index": 445},
        "relations": []
    }, {
        "meta": {"category": "sign&symptom", "text": "\u5fc3\u60b8", "id": 22, "start_index": 446, "end_index": 448},
        "relations": []
    }, {
        "meta": {"category": "sign&symptom", "text": "\u75bc\u75db", "id": 23, "start_index": 452, "end_index": 454},
        "relations": []
    }, {
        "meta": {"category": "sign&symptom", "text": "\u8179\u75db", "id": 24, "start_index": 455, "end_index": 457},
        "relations": []
    }, {
        "meta": {"category": "sign&symptom", "text": "\u8179\u80c0", "id": 25, "start_index": 458, "end_index": 460},
        "relations": []
    }, {
        "meta": {"category": "sign&symptom", "text": "\u8179\u6cfb", "id": 26, "start_index": 461, "end_index": 463},
        "relations": []
    }, {
        "meta": {"category": "sign&symptom", "text": "\u5c3f\u9891", "id": 27, "start_index": 464, "end_index": 466},
        "relations": []
    }, {
        "meta": {"category": "sign&symptom", "text": "\u5c3f\u6025", "id": 28, "start_index": 467, "end_index": 469},
        "relations": []
    }, {
        "meta": {"category": "sign&symptom", "text": "\u5c3f\u75db", "id": 29, "start_index": 470, "end_index": 472},
        "relations": []
    }, {
        "meta": {
            "category": "assessment",
            "text": "\u80f8\u90e8X\u7ebf",
            "id": 30,
            "start_index": 480,
            "end_index": 484
        },
        "relations": []
    }, {
        "meta": {
            "category": "assessment",
            "text": "\u8840\u5e38\u89c4",
            "id": 31,
            "start_index": 532,
            "end_index": 535
        },
        "relations": []
    }, {
        "meta": {
            "category": "assessment",
            "text": "\u75f0\u57f9\u517b",
            "id": 32,
            "start_index": 536,
            "end_index": 539
        },
        "relations": []
    }, {
        "meta": {"category": "assessment", "text": "\u8840\u6c89", "id": 33, "start_index": 540, "end_index": 542},
        "relations": []
    }, {
        "meta": {
            "category": "assessment",
            "text": "\u7ed3\u6838\u6297\u4f53",
            "id": 34,
            "start_index": 543,
            "end_index": 547
        }, "relations": []
    }, {
        "meta": {"category": "assessment", "text": "\u80f8\u90e8CT", "id": 35, "start_index": 552, "end_index": 556},
        "relations": []
    }, {
        "meta": {
            "category": "assessment",
            "text": "\u5fc3\u7535\u56fe",
            "id": 36,
            "start_index": 557,
            "end_index": 560
        },
        "relations": []
    }, {
        "meta": {"category": "treatment", "text": "\u6297\u708e", "id": 37, "start_index": 576, "end_index": 578},
        "relations": []
    }, {
        "meta": {"category": "treatment", "text": "\u5316\u75f0", "id": 38, "start_index": 579, "end_index": 581},
        "relations": []
    }, {
        "meta": {"category": "diagnosis", "text": "\u80ba\u7ed3\u6838", "id": 39, "start_index": 607, "end_index": 610},
        "relations": []
    }, {
        "meta": {"category": "diagnosis", "text": "\u80ba\u7ed3\u6838", "id": 40, "start_index": 611, "end_index": 614},
        "relations": []
    }, {
        "meta": {"category": "sign&symptom", "text": "\u4e2d\u6bd2", "id": 41, "start_index": 618, "end_index": 620},
        "relations": []
    }, {
        "meta": {"category": "sign&symptom", "text": "\u4f4e\u70ed", "id": 42, "start_index": 626, "end_index": 628},
        "relations": []
    }, {
        "meta": {"category": "sign&symptom", "text": "\u76d7\u6c57", "id": 43, "start_index": 629, "end_index": 631},
        "relations": []
    }, {
        "meta": {
            "category": "sign&symptom",
            "text": "\u75b2\u4e4f\u65e0\u529b",
            "id": 44,
            "start_index": 632,
            "end_index": 636
        }, "relations": []
    }, {
        "meta": {
            "category": "sign&symptom",
            "text": "\u4f53\u91cd\u51cf\u8f7b",
            "id": 45,
            "start_index": 637,
            "end_index": 641
        }, "relations": []
    }, {
        "meta": {"category": "sign&symptom", "text": "\u5931\u7720", "id": 46, "start_index": 642, "end_index": 644},
        "relations": []
    }, {
        "meta": {"category": "sign&symptom", "text": "\u5fc3\u60b8", "id": 47, "start_index": 645, "end_index": 647},
        "relations": []
    }, {
        "meta": {"category": "assessment", "text": "X\u7ebf", "id": 48, "start_index": 648, "end_index": 650},
        "relations": []
    }, {
        "meta": {"category": "assessment", "text": "\u80f8\u7247", "id": 49, "start_index": 650, "end_index": 652},
        "relations": []
    }, {
        "meta": {"category": "diagnosis", "text": "\u80ba\u764c", "id": 50, "start_index": 698, "end_index": 700},
        "relations": []
    }, {
        "meta": {"category": "sign&symptom", "text": "\u611f\u67d3", "id": 51, "start_index": 705, "end_index": 707},
        "relations": []
    }, {
        "meta": {
            "category": "sign&symptom",
            "text": "\u75f0\u4e2d\u5e26\u8840",
            "id": 52,
            "start_index": 712,
            "end_index": 716
        }, "relations": []
    }, {
        "meta": {"category": "diagnosis", "text": "\u80ba\u764c", "id": 53, "start_index": 738, "end_index": 740},
        "relations": []
    }, {
        "meta": {
            "category": "diagnosis",
            "text": "\u963b\u585e\u6027\u80ba\u708e",
            "id": 54,
            "start_index": 743,
            "end_index": 748
        }, "relations": []
    }, {
        "meta": {"category": "treatment", "text": "\u6297\u708e", "id": 55, "start_index": 750, "end_index": 752},
        "relations": []
    }, {
        "meta": {"category": "sign&symptom", "text": "\u708e\u75c7", "id": 56, "start_index": 755, "end_index": 757},
        "relations": []
    }, {
        "meta": {"category": "sign&symptom", "text": "\u80bf\u7624", "id": 57, "start_index": 760, "end_index": 762},
        "relations": []
    }, {
        "meta": {"category": "sign&symptom", "text": "\u80bf\u5927", "id": 58, "start_index": 776, "end_index": 778},
        "relations": []
    }, {
        "meta": {"category": "diagnosis", "text": "\u80ba\u4e0d\u5f20", "id": 59, "start_index": 783, "end_index": 786},
        "relations": []
    }, {
        "meta": {"category": "assessment", "text": "CT", "id": 60, "start_index": 801, "end_index": 803},
        "relations": []
    }, {
        "meta": {"category": "assessment", "text": "MRI", "id": 61, "start_index": 804, "end_index": 807},
        "relations": []
    }, {
        "meta": {
            "category": "assessment",
            "text": "\u7ea4\u7ef4\u652f\u6c14\u7ba1\u955c",
            "id": 62,
            "start_index": 808,
            "end_index": 814
        }, "relations": []
    }, {
        "meta": {
            "category": "assessment",
            "text": "\u75f0\u8131\u843d\u7ec6\u80de",
            "id": 63,
            "start_index": 815,
            "end_index": 820
        }, "relations": []
    }, {
        "meta": {"category": "diagnosis", "text": "\u80ba\u8113\u80bf", "id": 64, "start_index": 828, "end_index": 831},
        "relations": []
    }, {
        "meta": {"category": "diagnosis", "text": "\u80ba\u708e", "id": 65, "start_index": 839, "end_index": 841},
        "relations": []
    }, {
        "meta": {
            "category": "assessment",
            "text": "\u94fe\u7403\u83cc",
            "id": 66,
            "start_index": 841,
            "end_index": 844
        },
        "relations": []
    }, {
        "meta": {"category": "diagnosis", "text": "\u80ba\u708e", "id": 67, "start_index": 844, "end_index": 846},
        "relations": []
    }, {
        "meta": {"category": "diagnosis", "text": "\u80ba\u8113\u80bf", "id": 68, "start_index": 864, "end_index": 867},
        "relations": []
    }, {
        "meta": {"category": "assessment", "text": "X\u7ebf", "id": 69, "start_index": 870, "end_index": 872},
        "relations": []
    }, {
        "meta": {"category": "diagnosis", "text": "\u80ba\u708e", "id": 70, "start_index": 883, "end_index": 885},
        "relations": []
    }]
};

let results = labels['concepts'].map(x => {
    return {
        'category': Categories[x['meta']['category']],
        'pos': [x['meta']['start_index'], x['meta']['end_index'] - 1]
    };
});
window['r'] = raw;
window['l'] = labels;
window['svg'] = SVG;
console.log(results);

annotator.import(raw, results);
