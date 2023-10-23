import { ipcRenderer } from 'electron';

export default {
  name: 'settings-dialog',
  template: require('./settings-dialog.html'),
  data: () => ({
    dialogOpened: false,
    gcloudPath: ''
  }),
  methods: {
    async save() {
      await ipcRenderer.invoke('save-settings', { gcloudPath: this.gcloudPath });
      ipcRenderer.send('restart');
    },
    async open() {
      const settings = await ipcRenderer.invoke('load-settings');
      this.gcloudPath = settings.gcloudPath || '';
      this.dialogOpened = true;
    }
  },
  mounted() {
    ipcRenderer.on('show-settings', this.open);
  }
};
