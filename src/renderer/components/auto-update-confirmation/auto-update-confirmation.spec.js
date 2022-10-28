import { mount } from '@vue/test-utils';
import { ipcRenderer, shell } from 'electron';
import AutoUpdateConfirmation from './auto-update-confirmation';

describe('AutoUpdateConfirmation', () => {
  it('should display dialog with version and release notes when update-notification event arrives', () => {
    const fakeEvent = {};
    const { vm } = mount(AutoUpdateConfirmation);
    expect(vm.dialogOpened).to.be.false;

    ipcRenderer.emit('update-notification', fakeEvent, { version: '1.2.3', releaseNotes: 'nice, new feature' });

    expect(vm.dialogOpened).to.be.true;
    expect(vm.version).to.eql('1.2.3');
    expect(vm.releaseNotes).to.eql('nice, new feature');
  });

  it('should open download page when button clicked', async () => {
    sinon.stub(shell, 'openExternal');
    const fakeEvent = {};
    const wrapper = mount(AutoUpdateConfirmation);
    ipcRenderer.emit('update-notification', fakeEvent, { version: '1.2.3', releaseNotes: 'nice, new feature' });

    await wrapper.find('.e-btn').trigger('click');

    expect(shell.openExternal)
      .to.have.been.calledWith('https://github.com/emartech/gap-secret-editor/releases/tag/v1.2.3');
  });
});
