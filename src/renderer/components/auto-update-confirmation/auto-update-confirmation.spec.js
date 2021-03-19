import { mount } from '@vue/test-utils';
import { ipcRenderer } from 'electron';
import AutoUpdateConfirmation from './auto-update-confirmation';

describe('AutoUpdateConfirmation', () => {
  it('should display dialog with version and release notes when confirm-update event arrives', () => {
    const fakeEvent = { sender: { send: sinon.stub() } };
    const { vm } = mount(AutoUpdateConfirmation);
    expect(vm.dialogOpened).to.be.false;

    ipcRenderer.emit('confirm-update', fakeEvent, { version: '1.2.3', releaseNotes: 'nice, new feature' });

    expect(vm.dialogOpened).to.be.true;
    expect(vm.version).to.eql('1.2.3');
    expect(vm.releaseNotes).to.eql('nice, new feature');
  });

  describe('#installNow', () => {
    it('should send true as confirm response', () => {
      const fakeEvent = { sender: { send: sinon.stub() } };
      const { vm } = mount(AutoUpdateConfirmation);
      ipcRenderer.emit('confirm-update', fakeEvent, { version: '1.2.3', releaseNotes: 'nice, new feature' });

      vm.installNow();

      expect(fakeEvent.sender.send).to.have.been.calledWith('confirm-update-response', true);
    });

    it('should close dialog and display loading indicator', () => {
      const fakeEvent = { sender: { send: sinon.stub() } };
      const { vm } = mount(AutoUpdateConfirmation);
      ipcRenderer.emit('confirm-update', fakeEvent, { version: '1.2.3', releaseNotes: 'nice, new feature' });

      vm.installNow();

      expect(vm.dialogOpened).to.be.false;
      expect(vm.updateInProgress).to.be.true;
    });
  });

  describe('#installLater', () => {
    it('should send false as confirm response', () => {
      const fakeEvent = { sender: { send: sinon.stub() } };
      const { vm } = mount(AutoUpdateConfirmation);
      ipcRenderer.emit('confirm-update', fakeEvent, { version: '1.2.3', releaseNotes: 'nice, new feature' });

      vm.installLater();

      expect(fakeEvent.sender.send).to.have.been.calledWith('confirm-update-response', false);
    });

    it('should close dialog with no loading indicator', () => {
      const fakeEvent = { sender: { send: sinon.stub() } };
      const { vm } = mount(AutoUpdateConfirmation);
      ipcRenderer.emit('confirm-update', fakeEvent, { version: '1.2.3', releaseNotes: 'nice, new feature' });

      vm.installLater();

      expect(vm.dialogOpened).to.be.false;
      expect(vm.updateInProgress).to.be.false;
    });
  });
});
