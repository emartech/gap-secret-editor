import Vue from 'vue';

import App from './components/app/app';

if (!process.env.IS_WEB) Vue.use(require('vue-electron'));
Vue.config.productionTip = false;

new Vue({
  components: { App },
  template: '<App/>'
}).$mount('#app');
