import { mount } from '@vue/test-utils';
import { rmSync, writeFileSync } from 'fs';
import SettingsDialog, { SETTING_FILE_NAME } from './settings-dialog';
import { ipcRenderer } from 'electron';
import { getDataPath, getSync, setDataPath, setSync } from 'electron-json-storage';

describe('SettingsDialog', () => {
  const settingsFilePath = '/tmp/secret-editor-test/';

  context('when show-settings event arrives', () => {
    it('should display dialog', async () => {
      const wrapper = mount(SettingsDialog);
      expect(wrapper.vm.dialogOpened).to.be.false;

      await emitShowSettings(wrapper);

      expect(wrapper.vm.dialogOpened).to.be.true;
    });

    it('should call setDataPath on electron-storage-json', async () => {
      const wrapper = mount(SettingsDialog);
      setDataPath('/oldTestPath');

      await emitShowSettings(wrapper);

      expect(getDataPath()).to.eql(settingsFilePath);
    });

    it('should initialise settings when settings file does not exist', async () => {
      rmSync(settingsFilePath, { force: true, recursive: true });
      const wrapper = mount(SettingsDialog);

      await emitShowSettings(wrapper);

      expect(wrapper.find('#gcloud-path').element.value).to.eql('');
    });

    it('should initialise glcoud path when settings file exists but path is not set', async () => {
      setSync(SETTING_FILE_NAME, {}, { dataPath: settingsFilePath });
      const wrapper = mount(SettingsDialog);

      await emitShowSettings(wrapper);

      expect(wrapper.find('#gcloud-path').element.value).to.eql('');
    });

    it('should initialise glcoud path when settings file contains invalid json', async () => {
      writeFileSync(`${settingsFilePath}/${SETTING_FILE_NAME}.json`, 'INVALID');
      const wrapper = mount(SettingsDialog);

      await emitShowSettings(wrapper);

      expect(wrapper.find('#gcloud-path').element.value).to.eql('');
    });

    it('should initialise glcoud path when settings file exists and path is set', async () => {
      setSync(SETTING_FILE_NAME, { gcloudPath: '/some-interesting-path' }, { dataPath: settingsFilePath });
      const wrapper = mount(SettingsDialog);

      await emitShowSettings(wrapper);

      expect(wrapper.find('#gcloud-path').element.value).to.eql('/some-interesting-path');
    });
  });

  describe('#save', () => {
    it('should update settings file', async () => {
      setSync(SETTING_FILE_NAME, { gcloudPath: '/some-interesting-path' }, { dataPath: settingsFilePath });
      const wrapper = mount(SettingsDialog);
      await emitShowSettings(wrapper);

      await wrapper.find('#gcloud-path').setValue('/an-even-more-interesting-path');
      await wrapper.find('#saveButton').trigger('click');

      expect(getSync(SETTING_FILE_NAME)).to.eql({ gcloudPath: '/an-even-more-interesting-path' });
    });

    it('should send restart message to main process when save button clicked', async () => {
      sinon.stub(ipcRenderer, 'send');
      const wrapper = mount(SettingsDialog);
      await emitShowSettings(wrapper);

      await wrapper.find('#saveButton').trigger('click');

      expect(ipcRenderer.send).to.have.been.calledWith('restart');
    });
  });

  const emitShowSettings = async (wrapper) => {
    ipcRenderer.emit('show-settings', {}, settingsFilePath);
    await wrapper.vm.$nextTick();
  };
});
