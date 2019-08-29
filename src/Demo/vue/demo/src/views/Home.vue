<template>
    <v-container class="grey lighten-5 pa-0">
        <v-row no-gutters>
            <DemoGuide></DemoGuide>
            <NPMGuide></NPMGuide>
        </v-row>
    </v-container>
</template>

<script lang="ts">
    import Vue from "vue";
    import DemoGuide from "@/components/DemoGuide.vue";
    import NPMGuide from "@/components/NPMGuide.vue";

    export default Vue.extend({
        components: {DemoGuide, NPMGuide},
    });
</script>

<style scoped>
    @import "~prismjs/themes/prism-dark.css";

    .container {
        max-height: calc(100vh - 64px);
        overflow: hidden;
    }
</style>
