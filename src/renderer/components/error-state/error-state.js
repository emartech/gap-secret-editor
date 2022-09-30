import { ipcRenderer, shell } from 'electron';

export default {
  name: 'error-state',
  template: require('./error-state.html'),
  methods: {
    openLink(url) {
      shell.openExternal(url);
    },
    restart() {
      localStorage.clear();
      ipcRenderer.send('restart');
    }
  }
};
