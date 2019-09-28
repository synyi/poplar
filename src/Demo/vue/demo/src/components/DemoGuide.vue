<template>
    <v-col class="demo-guide pa-2">
        <h1>{{ $t("demoInfo") }}</h1>
        <ol>
            <li>
                <h2>{{ $t('uploadOrUseDefault') }}</h2>
                <div>
                    <p>{{ $t("jsonFormat") }}</p>
                    <code v-html="highlight($t('jsonFormatTemplate'))"></code>
                    <p>{{ $t("forExample") }}</p>
                    <code v-html="highlight($t('jsonFormatExample'))"></code>
                </div>
            </li>
            <li>
                <h2>{{ $t("dataDisplay") }}</h2>
                <div>
                    <p>{{ $t("leftPage") }}</p>
                    <p>{{ $t("rightPage") }}</p>
                    <br>
                    <img src="https://i.loli.net/2019/08/30/YUuJnyr8iIAmTft.png"></div>
            </li>
            <li>
                <h2>{{ $t("annotate") }}</h2>
                <div>
                    <p>{{ $t("selectText") }}</p>
                    <br>
                    <img alt="1.gif" src="https://i.loli.net/2018/08/16/5b751591a98af.gif" title="1.gif"/>
                </div>
            </li>
            <li>
                <h2>{{ $t("connection") }}</h2>
                <div>
                    <p>{{ $t("clickToConnect") }}</p>
                    <br>
                    <img alt="2.gif" src="https://i.loli.net/2018/08/16/5b751591c8cc6.gif" title="2.gif"/>
                </div>
            </li>
            <li>
                <h2>{{ $t("delete") }}</h2>
                <p>
                    {{ $t("rightToDelete") }}
                </p>
            </li>
            <li>
                <h2>{{ $t("update") }}</h2>
                <p>
                    {{ $t("rightAndCtrlToUpdate") }}
                </p>
            </li>
            <li>
                <h2>{{ $t("downloadJSON") }}</h2>
                <p>
                    {{ $t("clickToDownload") }}
                </p>
            </li>
        </ol>
    </v-col>
</template>

<script lang="ts">
    import Vue from "vue";
    import Prism from "prismjs";

    export default Vue.extend({
        methods: {
            highlight(code: string): string {
                return Prism.highlight(code, Prism.languages.javascript, "javascript");
            }
        }
    });
</script>

<style scoped>
    @import "~prismjs/themes/prism-dark.css";

    .demo-guide {
        max-height: calc(100vh - 64px);
        overflow: scroll;
        border-right: solid 2px black;
    }

    img {
        max-width: 40vw;
    }

    p {
        margin-top: 16px;
    }

    code {
        max-width: calc(45vw - 16px);
        background: rgb(32, 32, 32) !important;
        box-shadow: none !important;
        padding: 8px !important;
        padding-right: 40px !important;
    }
</style>
