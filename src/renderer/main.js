import Vue from 'vue';
import createStore from './store/store';
import registerVueGlobals from './vue-globals';

import App from './components/app/app';

if (!process.env.IS_WEB) Vue.use(require('vue-electron'));
Vue.config.productionTip = false;
Vue.config.ignoredElements = ['e-dropdown-handler'];

registerVueGlobals();

new Vue({
  components: { App },
  template: '<App/>',
  store: createStore()
}).$mount('#app');
