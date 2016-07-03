/// <reference path="svgjs/svgjs.d.ts" />
import {Annotator} from './lib/Annotator';
import LinkedHTMLElement = svgjs.LinkedHTMLElement;
let annotator = new Annotator('drawing', 2000, 2000);

// Init.
let raw = `猫是纯食肉动物，无肉不欢。人类的食物要慎重给猫，即便它看上去很想吃，或者吃的津津有味，比如干鱿鱼丝。巧克力中的可可碱对猫有毒性。
它们每天几乎16~20小时在睡觉，有2次（每次20分钟）活跃时间。注意家里的易碎品。餐具，杯子，花瓶等等，它们会不经意弄掉地上。
可不用洗澡。如果猫不甚外出几天发现身上脏了再洗即可。猫有很强的自理能力，猫的唾液是最强力的清洁剂，它们会把自己打扮的干干净净的。
猫玩具可以不用买。它们自得其乐，找到根羽毛都可以自high半天。`;

annotator.import(raw);
