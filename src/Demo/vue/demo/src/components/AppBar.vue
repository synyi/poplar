<template>
    <v-app-bar app bottom>
        <v-container class="d-flex justify-center">
            <v-menu offset-y>
                <template v-slot:activator="{ on }">
                    <v-btn color="primary ma-1" v-on="on">
                        {{$t('language')}}
                    </v-btn>
                </template>
                <v-list>
                    <v-list-item
                            :key="index"
                            @click="switchLanguage(item.locale)"
                            v-for="(item, index) in languages">
                        <v-list-item-title>{{ item.title }}</v-list-item-title>
                    </v-list-item>
                </v-list>
            </v-menu>
            <v-btn @click="download" color="primary ma-1"
                   v-if="this.$router.currentRoute.fullPath.includes('annotate')">
                <v-icon left>mdi-cloud-download</v-icon>
                {{ $t("download") + "JSON" }}
            </v-btn>
            <v-btn @click="downloadSVG" color="primary ma-1"
                   v-if="this.$router.currentRoute.fullPath.includes('annotate')">
                <v-icon left>mdi-cloud-download</v-icon>
                {{ $t("download") + "SVG" }}
            </v-btn>
            <v-btn @click="upload" color="primary ma-1">
                <v-icon left>mdi-cloud-upload</v-icon>
                {{ $t("upload") }}
            </v-btn>
            <v-btn @click="useDefault" color="primary ma-1">{{ $t("useExample") }}</v-btn>
        </v-container>
    </v-app-bar>
</template>

<script lang="ts">
    import Vue from "vue";
    import defaultData from "@/assets/default.json";

    export default Vue.extend({
        data: () => ({
            languages: [{
                title: "中文",
                locale: "zh"
            }, {
                title: "English",
                locale: "en"
            }],
        }),
        methods: {
            switchLanguage(locale: string) {
                this.$i18n.locale = locale;
            },
            upload() {
                window.setTimeout(() => {
                    this.$eventbus.$emit("fileUploaded", {data: null});
                    this.$forceUpdate();
                }, 10);
                this.$router.push("annotate").catch(_ => {
                });
            },
            download() {
                this.$eventbus.$emit("downloadRequest");
            },
            downloadSVG() {
                this.$eventbus.$emit("downloadSVGRequest");
            },
            useDefault() {
                window.setTimeout(() => {
                    this.$eventbus.$emit("fileUploaded", defaultData);
                    this.$forceUpdate();
                }, 10);
                this.$router.push("annotate").catch(_ => {
                });
            }
        }
    });
</script>

<style scoped>

</style>
