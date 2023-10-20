import { ipcRenderer } from 'electron';
import { setDataPath, getSync, setSync } from 'electron-json-storage';

export const SETTING_FILE_NAME = 'secret-editor-settings';

export default {
  name: 'settings-dialog',
  template: require('./settings-dialog.html'),
  data: () => ({
    dialogOpened: false,
    gcloudPath: ''
  }),
  methods: {
    save() {
      setSync(SETTING_FILE_NAME, { gcloudPath: this.gcloudPath });
      ipcRenderer.send('restart');
    }
  },
  mounted() {
    ipcRenderer.on('show-settings', (event, path) => {
      setDataPath(path);
      this.gcloudPath = loadSettings().gcloudPath || '';
      this.dialogOpened = true;
    });
  }
};

const loadSettings = () => {
  try {
    return getSync(SETTING_FILE_NAME);
  } catch (error) {
    return {};
  }
};
