import { ipcRenderer } from 'electron';

export default {
  name: 'auto-update-confirmation',
  template: require('./auto-update-confirmation.html'),
  data: () => ({
    updateInProgress: false,
    dialogOpened: false,
    version: '',
    releaseNotes: '',
    confirmUpdateEvent: null
  }),
  methods: {
    installLater() {
      this.confirmUpdateEvent.sender.send('confirm-update-response', false);
      this.dialogOpened = false;
    },
    installNow() {
      this.confirmUpdateEvent.sender.send('confirm-update-response', true);
      this.dialogOpened = false;
      this.updateInProgress = true;
    }
  },
  mounted() {
    ipcRenderer.on('confirm-update', async (event, updateInfo) => {
      this.confirmUpdateEvent = event;
      this.version = updateInfo.version;
      this.releaseNotes = updateInfo.releaseNotes;
      this.dialogOpened = true;
    });
  }
};
