<template>
    <div class="demo">
        <div class="content">
            <div class="left">
                <div class="svgContainer" ref="svgContainer"></div>
                <div v-if="!uploaded" class="typo">
                    <h1>Demo使用说明</h1>
                    <ol>
                        <li>
                            <h2>上传JSON格式文件（或直接使用样例文本）</h2>
                            <div>
                                <p>JSON文件格式如下：</p>
                                <br>
                                <img src="http://www.pic68.com/uploads/2018/08/1(7).png"/></div>
                        </li>
                        <li>
                            <h2>数据显示</h2>
                            <div>
                                <p>左侧会显示出标注页面</p>
                                <p>右侧会显示出对应JSON数据</p>
                                <br>
                                <img src="http://www.pic68.com/uploads/2018/08/2(4).png"></div>
                        </li>
                        <li>
                            <h2>标注</h2>
                            <div>
                                <p>选择一些文字来标注</p>
                                <br>
                                <img src="https://i.loli.net/2018/08/16/5b751591a98af.gif" alt="1.gif" title="1.gif"/>
                            </div>
                        </li>
                        <li>
                            <h2>连接</h2>
                            <div>
                                <p>点击两个标注来连接它们</p>
                                <br>
                                <img src="https://i.loli.net/2018/08/16/5b751591c8cc6.gif" alt="2.gif" title="2.gif"/>
                            </div>
                        </li>
                        <li>
                            <h2>删除</h2>
                            <p>
                                在标注或连接的文字部分右键可以删除对应元素
                            </p>
                        </li>
                        <li>
                            <h2>下载JSON数据</h2>
                            <p>
                                点击下载即可
                            </p>
                        </li>
                    </ol>
                </div>
            </div>
            <div class="right">
                <div v-if="!uploaded" class="typo">
                    <h1>npm包使用说明</h1>
                    <h2>Install</h2>
                    <p>在你的Web项目中：</p>
                    <pre><code>npm install poplar-annotation</code></pre>
                    即可安装。
                    <p>阅读下面的API Reference来了解具体使用方法</p>
                    <h2>API Reference</h2>
                    <a href="https://github.com/synyi/poplar/blob/master/doc/zh.md">中文</a>
                    <br>
                    <a href="https://github.com/synyi/poplar/blob/master/doc/en.md">English</a>
                    <div style="margin-top: 20px">
                        <h2>Need more information?
                            <br>Find a bug?
                            <br>Need some feature?
                            <br>Want to discuss sth with developer?
                        </h2>
                        <p>Welcome to view our <a href="https://github.com/synyi/poplar">GitHub</a>.</p>
                        <p>And feel free to <a href="https://github.com/synyi/poplar/issues/new">open an issue</a> if
                            you need any
                            help.</p>
                    </div>
                </div>
                <code v-if="uploaded" ref="code">
                </code>
            </div>
            <v-dialog v-model="showLabelCategoriesDialog" persistent max-width="290">
                <v-card>
                    <v-card-title>
                        <span class="headline">请选择分类</span>
                    </v-card-title>
                    <v-card-text>
                        <v-radio-group v-model="selectedLabelCategory">
                            <v-radio v-for="category in this.labelCategories"
                                     :key="category.id"
                                     :label="category.text"
                                     :value="category.id"></v-radio>
                        </v-radio-group>
                    </v-card-text>
                    <v-card-actions>
                        <v-btn color="blue darken-1" flat="flat" @click="showLabelCategoriesDialog = false">
                            取消
                        </v-btn>
                        <v-btn color="green darken-1" flat="flat" @click="createLabel">
                            确定
                        </v-btn>
                    </v-card-actions>
                </v-card>
            </v-dialog>
            <v-dialog v-model="showConnectionCategoriesDialog" persistent max-width="290">
                <v-card>
                    <v-card-title>
                        <span class="headline">请选择分类</span>
                    </v-card-title>
                    <v-card-text>
                        <v-radio-group v-model="selectedConnectionCategory">
                            <v-radio v-for="category in this.connectionCategories"
                                     :key="category.id"
                                     :label="category.text"
                                     :value="category.id"></v-radio>
                        </v-radio-group>
                    </v-card-text>
                    <v-card-actions>
                        <v-btn color="blue darken-1" flat="flat" @click="showConnectionCategoriesDialog = false">
                            取消
                        </v-btn>
                        <v-btn color="green darken-1" flat="flat" @click="createConnection">
                            确定
                        </v-btn>
                    </v-card-actions>
                </v-card>
            </v-dialog>
        </div>
        <div class="bottom-bar">
            <div class="button-group">
                <button class="btn" v-if="!uploaded" @click="useDefault">使用样例文本</button>
                <button class="btn upload-button"><input class="upload" type="file"
                                                         @change="upload">
                    上传
                </button>
                <button class="btn" v-if="uploaded" @click="download">下载</button>
            </div>
        </div>
    </div>
</template>

<script>
    import {Action, Annotator} from 'poplar-annotation'

    const defaultJson = "{\"content\":\"北冥有鱼，其名为鲲。鲲之大，不知其几千里也；化而为鸟，其名为鹏。鹏之背，不知其几千里也；怒而飞，其翼若垂天之云。是鸟也，海运则将徙于南冥。南冥者，天池也。《齐谐》者，志怪者也。《谐》之言曰：“鹏之徙于南冥也，水击三千里，抟扶摇而上者九万里，去以六月息者也。”野马也，尘埃也，生物之以息相吹也。天之苍苍，其正色邪？其远而无所至极邪？其视下也，亦若是则已矣。且夫水之积也不厚，则其负大舟也无力。覆杯水于坳堂之上，则芥为之舟，置杯焉则胶，水浅而舟大也。风之积也不厚，则其负大翼也无力。故九万里，则风斯在下矣，而后乃今培风；背负青天，而莫之夭阏者，而后乃今将图南。蜩与学鸠笑之曰：“我决起而飞，抢榆枋而止，时则不至，而控于地而已矣，奚以之九万里而南为？”适莽苍者，三餐而反，腹犹果然；适百里者，宿舂粮；适千里者，三月聚粮。之二虫又何知！小知不及大知，小年不及大年。奚以知其然也？朝菌不知晦朔，蟪蛄不知春秋，此小年也。楚之南有冥灵者，以五百岁为春，五百岁为秋；上古有大椿者，以八千岁为春，八千岁为秋，此大年也。而彭祖乃今以久特闻，众人匹之，不亦悲乎！汤之问棘也是已。穷发之北，有冥海者，天池也。有鱼焉，其广数千里，未有知其修者，其名为鲲。有鸟焉，其名为鹏，背若泰山，翼若垂天之云，抟扶摇羊角而上者九万里，绝云气，负青天，然后图南，且适南冥也。斥鴳笑之曰：“彼且奚适也？我腾跃而上，不过数仞而下，翱翔蓬蒿之间，此亦飞之至也。而彼且奚适也？”此小大之辩也。故夫知效一官，行比一乡，德合一君，而征一国者，其自视也，亦若此矣。而宋荣子犹然笑之。且举世誉之而不加劝，举世非之而不加沮，定乎内外之分，辩乎荣辱之境，斯已矣。彼其于世，未数数然也。虽然，犹有未树也。夫列子御风而行，泠然善也，旬有五日而后反。彼于致福者，未数数然也。此虽免乎行，犹有所待者也。若夫乘天地之正，而御六气之辩，以游无穷者，彼且恶乎待哉？故曰：至人无己，神人无功，圣人无名。\",\"labelCategories\":[{\"id\":\"0\",\"text\":\"名词\",\"color\":\"#eac0a2\",\"border-color\":\"#8c7361\"},{\"id\":\"1\",\"text\":\"动词\",\"color\":\"#619dff\",\"border-color\":\"#3c619d\"},{\"id\":\"2\",\"text\":\"形容词\",\"color\":\"#9d61ff\",\"border-color\":\"#613C9D\"},{\"id\":\"3\",\"text\":\"副词\",\"color\":\"#ff9d61\",\"border-color\":\"#995e3a\"}],\"labels\":[{\"id\":\"0\",\"categoryId\":\"0\",\"startIndex\":0,\"endIndex\":2},{\"id\":\"1\",\"categoryId\":\"0\",\"startIndex\":3,\"endIndex\":4},{\"id\":\"2\",\"categoryId\":\"0\",\"startIndex\":216,\"endIndex\":217},{\"id\":\"3\",\"categoryId\":\"2\",\"startIndex\":217,\"endIndex\":218},{\"id\":\"4\",\"categoryId\":\"0\",\"startIndex\":219,\"endIndex\":220},{\"id\":\"5\",\"categoryId\":\"2\",\"startIndex\":220,\"endIndex\":221},{\"id\":\"6\",\"categoryId\":\"0\",\"startIndex\":32,\"endIndex\":33},{\"id\":\"7\",\"categoryId\":\"1\",\"startIndex\":46,\"endIndex\":47},{\"id\":\"8\",\"categoryId\":\"0\",\"startIndex\":78,\"endIndex\":80},{\"id\":\"9\",\"categoryId\":\"1\",\"startIndex\":64,\"endIndex\":65}],\"connectionCategories\":[{\"id\":\"0\",\"text\":\"修饰\"},{\"id\":\"1\",\"text\":\"限定\"},{\"id\":\"2\",\"text\":\"是...的动作\"}],\"connections\":[{\"id\":\"0\",\"categoryId\":\"2\",\"fromId\":\"7\",\"toId\":\"6\"},{\"id\":\"1\",\"categoryId\":\"0\",\"fromId\":\"3\",\"toId\":\"2\"},{\"id\":\"2\",\"categoryId\":\"0\",\"fromId\":\"5\",\"toId\":\"4\"},{\"id\":\"3\",\"categoryId\":\"2\",\"fromId\":\"9\",\"toId\":\"6\"}]}";

    export default {
        name: 'Demo',
        data: function () {
            return {
                uploaded: false,
                selectedLabelCategory: null,
                showLabelCategoriesDialog: false,
                selectedConnectionCategory: null,
                showConnectionCategoriesDialog: false,
                annotator: null,
                startIndex: -1,
                endIndex: -1,
                first: -1,
                second: -1,
                code: ''
            }
        },
        methods: {
            constructAnnotator: function (data) {
                this.annotator = new Annotator(data, this.$refs.svgContainer);
                this.annotator.on('textSelected', (startIndex, endIndex) => {
                    this.startIndex = startIndex;
                    this.endIndex = endIndex;
                    this.showLabelCategoriesDialog = true;
                });
                this.annotator.on('labelRightClicked', (id) => {
                    this.annotator.applyAction(Action.Label.Delete(id));
                    this.getCode();
                });
                this.annotator.on('connectionRightClicked', (id) => {
                    this.annotator.applyAction(Action.Connection.Delete(id));
                    this.getCode();
                });
                this.annotator.on('textSelected', (startIndex, endIndex) => {
                    this.startIndex = startIndex;
                    this.endIndex = endIndex;
                    this.showLabelCategoriesDialog = true;
                });
                this.annotator.on('twoLabelsClicked', (first, second) => {
                    this.first = first;
                    this.second = second;
                    this.showConnectionCategoriesDialog = true;
                });
                setTimeout(() => this.getCode(), 100);
            },
            useDefault: function () {
                this.uploaded = true;
                this.constructAnnotator(defaultJson);
            },
            upload: function (e) {
                let reader = new FileReader();
                if (this.annotator !== null) {
                    this.$refs.svgContainer.innerHTML = "";
                }
                reader.readAsText(e.target.files[0]);
                reader.onload = (event) => {
                    this.constructAnnotator(event.target.result);
                    this.uploaded = true;
                }
            },
            createLabel() {
                console.log(this.selectedLabelCategory, this.startIndex, this.endIndex);
                this.annotator.applyAction(Action.Label.Create(this.selectedLabelCategory, this.startIndex, this.endIndex));
                this.showLabelCategoriesDialog = false;
                this.getCode();
            },
            createConnection() {
                this.annotator.applyAction(Action.Connection.Create(this.selectedConnectionCategory, this.first, this.second));
                this.showConnectionCategoriesDialog = false;
                this.getCode();
            },
            getCode: function () {
                if (this.annotator === null) {
                    this.code = '';
                }
                this.$refs.code.innerHTML = JSON.stringify(this.annotator.store.json, null, 2);
                setTimeout(() => hljs.highlightBlock(this.$refs.code), 500);
            },
            download: function () {
                let eleLink = document.createElement('a');
                eleLink.download = 'data.json';
                eleLink.style.display = 'none';
                let blob = new Blob([JSON.stringify(this.annotator.store.json)]);
                eleLink.href = URL.createObjectURL(blob);
                document.body.appendChild(eleLink);
                eleLink.click();
                document.body.removeChild(eleLink);
            }
        },
        computed: {
            labelCategories: function () {
                if (this.annotator === null) return [];
                let result = [];
                for (let [_, category] of this.annotator.store.labelCategoryRepo) {
                    result.push(category);
                }
                return result;
            },
            connectionCategories: function () {
                if (this.annotator === null) return [];
                let result = [];
                for (let [_, category] of this.annotator.store.connectionCategoryRepo) {
                    result.push(category);
                }
                return result;
            }
        }
    }
</script>

<style scoped>
    h1, h2, button {
        font-weight: 300 !important;
    }

    .demo {
        max-height: 100vh;
        overflow: scroll;
    }

    .content {
        height: calc(100vh - 60px);
        max-height: calc(100vh - 60px);
        overflow: scroll;
        display: flex;
        justify-content: center;
    }

    .bottom-bar {
        position: absolute;
        left: 0;
        right: 0;
        bottom: 0;
        background: #0066CC;
        height: 60px;
    }

    .button-group {
        width: 100%;
        height: 60px;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .btn {
        color: white;
        box-shadow: rgba(0, 0, 0, 0.2) 0 3px 1px -2px, rgba(0, 0, 0, 0.137255) 0 2px 2px 0, rgba(0, 0, 0, 0.117647) 0 1px 5px 0;
        background: rgb(33, 150, 243);
        border: none;
        border-radius: 2px;
        padding: 6px 16px;
        margin-left: 1em;
        margin-right: 1em;
        font-size: 14px;
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
        outline: none;
        transition: 0.3s cubic-bezier(0.25, 0.8, 0.5, 1);
        font-weight: normal !important;
    }

    .btn:hover {
        cursor: pointer;
        background: rgb(32, 163, 255);
    }

    .left {
        display: inline-block;
        border-right: solid 2px #c8c8b7;
        width: 50%;
        max-width: 50vw;
        height: calc(100vh - 60px);
        max-height: calc(100vh - 60px);
        overflow: scroll;
        padding-left: 16px;
        padding-right: 16px;
        flex: 1;
    }

    .right {
        display: inline-block;
        border-left: solid 2px #c8c8b7;
        width: 50%;
        height: calc(100vh - 60px);
        max-height: calc(100vh - 60px);
        overflow: scroll;
        padding-left: 16px;
        padding-right: 16px;
        flex: 1;
    }

    .svgContainer {
        display: flex;
        font-family: "Source Sans Pro", -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
        font-weight: normal;
        font-size: 14px;
        max-width: 50vw;
        overflow: scroll;
    }

    .upload-button {
        width: 56px;
        padding-right: 0;
        padding-left: 0;
        cursor: pointer;
    }

    .upload {
        position: absolute;
        margin-left: -15px;
        margin-top: -6px;
        width: 56px;
        height: 37px;
        opacity: 0;
        cursor: pointer;
    }

    .typo a {
        color: #18b495
    }

    input {
        cursor: pointer;
    }
</style>

