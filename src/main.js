// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import Vuetify from 'vuetify'
import VueI18n from 'vue-i18n'
import 'vuetify/dist/vuetify.min.css'

Vue.use(Vuetify);
Vue.use(VueI18n);
const i18n = new VueI18n({
    locale: 'zh',
    messages: {
        zh: require('./common/zh'),
        en: require('./common/en')
    }
});


Vue.config.productionTip = false;

/* eslint-disable no-new */
new Vue({
    el: '#app',
    i18n,
    router,
    components: {App},
    template: '<App/>'
});
