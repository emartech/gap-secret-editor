import { mount } from '@vue/test-utils';
import { ipcRenderer } from 'electron';
import SettingsDialog from './settings-dialog';

describe('SettingsDialog', () => {
  const settingsFilePath = '/tmp/secret-editor-test/';

  it('should open dialog when show-settings event arrives', async () => {
    sinon.stub(ipcRenderer, 'invoke').resolves({});
    const wrapper = mount(SettingsDialog);
    expect(wrapper.vm.dialogOpened).to.be.false;

    ipcRenderer.emit('show-settings', {}, settingsFilePath);
    await wrapper.vm.$nextTick();

    expect(wrapper.vm.dialogOpened).to.be.true;
  });

  describe('#open', () => {
    it('should open dialog', async () => {
      sinon.stub(ipcRenderer, 'invoke').resolves({});
      const wrapper = mount(SettingsDialog);
      expect(wrapper.vm.dialogOpened).to.be.false;

      await wrapper.vm.open();

      expect(wrapper.vm.dialogOpened).to.be.true;
    });

    it('should fetch settings from main process', async () => {
      sinon.stub(ipcRenderer, 'invoke').resolves({});
      const wrapper = mount(SettingsDialog);
      expect(wrapper.vm.dialogOpened).to.be.false;

      await wrapper.vm.open();

      expect(ipcRenderer.invoke).to.have.been.calledWith('load-settings');
    });

    it('should initialise glcoud path when path is not set', async () => {
      sinon.stub(ipcRenderer, 'invoke').resolves({});
      const wrapper = mount(SettingsDialog);

      await wrapper.vm.open();

      expect(wrapper.find('#gcloud-path').element.value).to.eql('');
    });

    it('should initialise glcoud path when path is set', async () => {
      sinon.stub(ipcRenderer, 'invoke').resolves({ gcloudPath: '/some-interesting-path' });
      const wrapper = mount(SettingsDialog);

      await wrapper.vm.open();

      expect(wrapper.find('#gcloud-path').element.value).to.eql('/some-interesting-path');
    });
  });

  describe('#save', () => {
    it('should send message to main process to save settings', async () => {
      sinon.stub(ipcRenderer, 'invoke').resolves();
      const wrapper = mount(SettingsDialog);

      await wrapper.find('#gcloud-path').setValue('/some-interesting-path');
      await wrapper.find('#saveButton').trigger('click');

      expect(ipcRenderer.invoke).to.have.been.calledWith('save-settings', { gcloudPath: '/some-interesting-path' });
    });

    it('should send restart message to main process when save button clicked', async () => {
      sinon.stub(ipcRenderer, 'invoke').resolves();
      sinon.stub(ipcRenderer, 'send');
      const wrapper = mount(SettingsDialog);

      await wrapper.find('#saveButton').trigger('click');

      expect(ipcRenderer.send).to.have.been.calledWith('restart');
    });
  });
});
