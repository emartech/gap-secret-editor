import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export default () => new Vuex.Store({
  state: {
    backups: []
  },
  mutations: {
    setBackups: (state, backups) => { state.backups = backups; }
  }
});
