import { ipcRenderer } from 'electron';

export default {
  name: 'settings-dialog',
  template: require('./settings-dialog.html'),
  data: () => ({
    dialogOpened: false
  }),
  methods: {
    save() {
      console.log('save');
    }
  },
  mounted() {
    ipcRenderer.on('show-settings', async () => {
      this.dialogOpened = true;
    });
  }
};
