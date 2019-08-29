<template>
    <v-app>
        <AppBar></AppBar>
        <v-content>
            <router-view/>
        </v-content>
    </v-app>
</template>

<script lang="ts">
    import Vue from "vue";
    import AppBar from "@/components/AppBar.vue";

    export default Vue.extend({
        components: {
            AppBar
        }
    });
</script>
