import { ipcRenderer, shell } from 'electron';

export default {
  name: 'auto-update-confirmation',
  template: require('./auto-update-confirmation.html'),
  data: () => ({
    dialogOpened: false,
    version: '',
    releaseNotes: ''
  }),
  methods: {
    openDownloadPage() {
      shell.openExternal(`https://github.com/emartech/gap-secret-editor/releases/tag/v${this.version}`);
    }
  },
  mounted() {
    ipcRenderer.on('confirm-update', async (event, updateInfo) => {
      this.version = updateInfo.version;
      this.releaseNotes = updateInfo.releaseNotes;
      this.dialogOpened = true;
    });
  }
};
