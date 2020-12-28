import { ipcRenderer } from 'electron';
import { listenForUpdates } from './auto-update-confirmation';

describe('auto-update-confirmation', () => {
  it('should respond with true when user confirmed the update', async () => {
    sinon.stub(window.e.utils, 'openConsequentialConfirmationDialog').callsFake(config => {
      config.confirm.callback();
    });
    const fakeEvent = {
      sender: {}
    };
    const responseArguments = new Promise(resolve => {
      fakeEvent.sender.send = (channel, isConfirmed) => {
        resolve({ channel, isConfirmed });
      };
    });

    listenForUpdates();
    ipcRenderer.emit('confirm-update', fakeEvent, { update: 'info' });

    expect(await responseArguments).to.eql({
      channel: 'confirm-update-response',
      isConfirmed: true
    });
  });

  it('should respond with false when user cancelled the update', async () => {
    sinon.stub(window.e.utils, 'openConsequentialConfirmationDialog').callsFake(config => {
      config.cancel.callback();
    });
    const fakeEvent = {
      sender: {}
    };
    const responseArguments = new Promise(resolve => {
      fakeEvent.sender.send = (channel, isConfirmed) => {
        resolve({ channel, isConfirmed });
      };
    });

    listenForUpdates();
    ipcRenderer.emit('confirm-update', fakeEvent, { update: 'info' });

    expect(await responseArguments).to.eql({
      channel: 'confirm-update-response',
      isConfirmed: false
    });
  });
});
