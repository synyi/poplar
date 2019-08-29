<template>
    <v-col class="npm-guide pa-2 pl-6">
        <h1>{{ $t("npmInfo") }}</h1>
        <h2>Install</h2>
        <p>{{ $t("inYourWebProj" )}}</p>
        <code v-html="highlight($t('npm install poplar-annotation'))"></code>
        {{ $t("andItIsInstalled") }}
        <p>{{ $t("readRef") }}</p>
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

    .npm-guide {
        max-height: calc(100vh - 64px);
        overflow: scroll;
        border-left: solid 2px black;
    }

    code {
        max-width: calc(45vw - 16px);
        background: rgb(32, 32, 32) !important;
        box-shadow: none !important;
        padding: 8px !important;
        padding-right: 40px !important;
    }
</style>
