/// <reference path="svgjs/svgjs.d.ts" />
import {Annotator, Categories} from './lib/Annotator';
let annotator = new Annotator('drawing');

// Init.
// let raw = '首次病程记录\n肺部感染\n患者???，男,64岁因“发热咳嗽咳痰3天”入院\n发热咳嗽咳痰3天\n头颅无畸形，直径约2.0mm，鼻无畸形\n无异常分泌物\n口唇微绀，\n浅表淋巴结未及肿大\n双侧呼吸运动对称，双侧语颤对称，双肺叩清音，右下肺闻及上饶市人民医院姓名：郑礼金科别：呼吸科床号：045住院号：0000177湿罗音\n心尖搏动位于左锁骨中线第五肋间内0.5cm，搏动有力，心界无扩大，心率：89次/分，未闻及杂音\n脊柱呈生理弯曲，无压痛及叩痛，四肢关节无畸形，活动自如，\n双侧甲状腺不大，\n外院胸部X线：右下肺感染\n37.3℃21次/分126/50mmHg正常面容表情自然步态正常言语清楚全身皮肤、粘膜无皮疹\n胸廓无畸形，右下肺闻及湿罗音\n周围性血管征阴性\n腹部平软，右下腹麦氏点无压痛，无反跳痛及肌紧张\n3次/分，无亢进或减退\n患者自诉三天前无明显诱因的出现发热，体温最高达40.5℃，热型不祥，伴畏寒无盗汗，后出现咳嗽咳痰，呈非刺激性咳嗽，白色粘液痰，量少，不易咳出，无头痛、头晕、咽痛、胸痛、心悸、心前区疼痛、腹痛、腹胀、腹泻、尿频、尿急、尿痛等症状\n在门诊行胸部X线示：故为求进一步诊治于今日入我科住院治疗，本次起病，精神、食纳、睡眠稍差，\n1、诊断方面：1）：血常规，痰培养，血沉，结核抗体等\n2）：胸部CT，心电图等\n2、治疗方面：卧床休息\n给予抗炎、化痰等综合治疗\n3、待检查结果出来后再行进一步诊治\n1、肺结核：肺结核多有全身中毒症状，如午后低热、盗汗、疲乏无力，体重减轻、失眠、心悸\nX线胸片见病变多在肺尖或锁骨上下，密度不均，消散缓慢，且有形成空洞或肺内播散\n一般抗菌治疗无效\n2、肺癌：多无急性感染症状，有时痰中带血丝\n白细胞计数不高，痰中发现癌细胞可以确诊\n肺癌可伴有阻塞性肺炎，经抗炎治疗后炎症消退，肿瘤阴影渐趋明显，或减肺门淋巴结肿大，有时出现肺不张\n对吸烟及年龄的患者，必要时行CT、MRI、纤维支气管镜和痰脱落细胞检查等\n3、急性肺脓肿：早期临床表现与肺炎链球菌肺炎相似\n但随病程进展，咳出大量脓臭痰为肺脓肿特征\nX线显示脓腔及气液平，易与肺炎鉴别\nremovedtotalphasesis107totalphaseis222';
let raw ="出院记录\n入院后完善相关检查，血常规：WBC:13.528109/L，HGB:131.00g/L，N:84.30%，\nL：8.60%\n心肌酶：CK：20.00U/L,CKMB:37.40U/L\n电解质：氯：86.50mmol/L\n血气分析：\nPH：7.225，PCO2：93.8mmHg，PO2:43mmHg\n电解质：钾：3.47mmoL／L,钠：134.9mmoL／L，\n氯：81.60mmoL／L，钙：1.90mmoL／L\n予改善通气，化痰，解痉平喘，维持水电解质酸碱平衡等治疗\n1、患者廖怀德，男,63岁，因“反复咳、痰喘30余年，加重伴嗜睡半天”入院\n2、发育正常，营养中等，正常面容，表情淡漠，被动体位，平车入病房，嗜睡，\n言语清楚，查体欠合作\n心率112次/分，P2＞A2，未闻及各瓣膜听诊区病理性杂音\n周围血管征阴性\n腹平软，\n叩诊呈鼓音，无移动性浊音\n胃振水音（-）\n肠鸣音正常存在，3-4次/分，无亢进或减退\n脊柱及四肢活动好，无畸形，双下肢不肿\n生理反射存在，病理反射未引出\n3、实验室检查结果：暂缺\n1.肺性脑病2.慢性阻塞性肺病伴有急性加重3.慢性肺源性心脏病失代偿期\n4.冠状动脉粥样硬化性心脏病心功能III级";


for (let i=0; i<5; i++) {
    raw += raw;
}


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
labels = {"concepts": [{"meta": {"category": "assessment", "text": "\u8840\u5e38\u89c4", "id": 0, "start_index": 15, "end_index": 18}, "relations": []}, {"meta": {"category": "assessment", "text": "WBC", "id": 1, "start_index": 19, "end_index": 22}, "relations": []}, {"meta": {"category": "assessment", "text": "HGB", "id": 2, "start_index": 35, "end_index": 38}, "relations": []}, {"meta": {"category": "assessment", "text": "N", "id": 3, "start_index": 49, "end_index": 50}, "relations": []}, {"meta": {"category": "assessment", "text": "\u5fc3\u808c\u9176", "id": 4, "start_index": 67, "end_index": 70}, "relations": []}, {"meta": {"category": "assessment", "text": "CK", "id": 5, "start_index": 71, "end_index": 73}, "relations": []}, {"meta": {"category": "assessment", "text": "CKMB", "id": 6, "start_index": 83, "end_index": 87}, "relations": []}, {"meta": {"category": "assessment", "text": "\u7535\u89e3\u8d28", "id": 7, "start_index": 97, "end_index": 100}, "relations": []}, {"meta": {"category": "assessment", "text": "\u6c2f", "id": 8, "start_index": 101, "end_index": 102}, "relations": []}, {"meta": {"category": "assessment", "text": "\u8840\u6c14\u5206\u6790", "id": 9, "start_index": 115, "end_index": 119}, "relations": []}, {"meta": {"category": "assessment", "text": "PH", "id": 10, "start_index": 121, "end_index": 123}, "relations": []}, {"meta": {"category": "assessment", "text": "PCO2", "id": 11, "start_index": 130, "end_index": 134}, "relations": []}, {"meta": {"category": "assessment", "text": "PO2", "id": 12, "start_index": 144, "end_index": 147}, "relations": []}, {"meta": {"category": "assessment", "text": "\u7535\u89e3\u8d28", "id": 13, "start_index": 155, "end_index": 158}, "relations": []}, {"meta": {"category": "assessment", "text": "\u94be", "id": 14, "start_index": 159, "end_index": 160}, "relations": []}, {"meta": {"category": "assessment", "text": "\u94a0", "id": 15, "start_index": 172, "end_index": 173}, "relations": []}, {"meta": {"category": "assessment", "text": "\u9499", "id": 16, "start_index": 201, "end_index": 202}, "relations": []}, {"meta": {"category": "treatment", "text": "\u6539\u5584\u901a\u6c14", "id": 17, "start_index": 215, "end_index": 219}, "relations": []}, {"meta": {"category": "treatment", "text": "\u5316\u75f0", "id": 18, "start_index": 220, "end_index": 222}, "relations": []}, {"meta": {"category": "treatment", "text": "\u89e3\u75c9\u5e73\u5598", "id": 19, "start_index": 223, "end_index": 227}, "relations": []}, {"meta": {"category": "treatment", "text": "\u7ef4\u6301\u6c34\u7535\u89e3\u8d28\u9178\u78b1\u5e73\u8861", "id": 20, "start_index": 228, "end_index": 238}, "relations": []}, {"meta": {"category": "sign&symptom", "text": "\u54b3", "id": 21, "start_index": 260, "end_index": 261}, "relations": []}, {"meta": {"category": "sign&symptom", "text": "\u75f0", "id": 22, "start_index": 262, "end_index": 263}, "relations": []}, {"meta": {"category": "sign&symptom", "text": "\u5598", "id": 23, "start_index": 263, "end_index": 264}, "relations": []}, {"meta": {"category": "sign&symptom", "text": "\u55dc\u7761", "id": 24, "start_index": 272, "end_index": 274}, "relations": []}, {"meta": {"category": "sign&symptom", "text": "\u55dc\u7761", "id": 25, "start_index": 313, "end_index": 315}, "relations": []}, {"meta": {"category": "sign&symptom", "text": "P2\uff1eA2", "id": 26, "start_index": 337, "end_index": 342}, "relations": []}, {"meta": {"category": "sign&symptom", "text": "\u6742\u97f3", "id": 27, "start_index": 355, "end_index": 357}, "relations": []}, {"meta": {"category": "sign&symptom", "text": "\u5468\u56f4\u8840\u7ba1\u5f81", "id": 28, "start_index": 358, "end_index": 363}, "relations": [{"category": "negation", "text": "\u9634\u6027", "start_index": 363, "end_index": 365}]}, {"meta": {"category": "sign&symptom", "text": "\u9f13\u97f3", "id": 29, "start_index": 374, "end_index": 376}, "relations": []}, {"meta": {"category": "sign&symptom", "text": "\u7578\u5f62", "id": 30, "start_index": 424, "end_index": 426}, "relations": [{"category": "negation", "text": "\u65e0", "start_index": 423, "end_index": 424}]}, {"meta": {"category": "sign&symptom", "text": "\u80bf", "id": 31, "start_index": 431, "end_index": 432}, "relations": [{"category": "negation", "text": "\u4e0d", "start_index": 430, "end_index": 431}]}, {"meta": {"category": "diagnosis", "text": "\u80ba\u6027\u8111\u75c5", "id": 32, "start_index": 463, "end_index": 467}, "relations": []}, {"meta": {"category": "diagnosis", "text": "\u6162\u6027\u963b\u585e\u6027\u80ba\u75c5", "id": 33, "start_index": 469, "end_index": 476}, "relations": []}, {"meta": {"category": "diagnosis", "text": "\u6162\u6027\u80ba\u6e90\u6027\u5fc3\u810f\u75c5", "id": 34, "start_index": 484, "end_index": 492}, "relations": []}, {"meta": {"category": "diagnosis", "text": "\u51a0\u72b6\u52a8\u8109\u7ca5\u6837\u786c\u5316\u6027\u5fc3\u810f\u75c5", "id": 35, "start_index": 499, "end_index": 511}, "relations": []}, {"meta": {"category": "assessment", "text": "\u5fc3\u529f\u80fd", "id": 36, "start_index": 511, "end_index": 514}, "relations": []}]};

let results = labels['concepts'].map(x => {
    return {
        'id': x['meta']['id'],
        'category': Categories[x['meta']['category']],
        'pos': [x['meta']['start_index'], x['meta']['end_index'] - 1]
    };
});
window['r'] = raw;
window['l'] = labels;
window['svg'] = SVG;
console.log(results);

annotator.import(raw, results);
