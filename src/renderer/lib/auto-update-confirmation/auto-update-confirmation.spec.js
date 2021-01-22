import { ipcRenderer } from 'electron';
import { listenForUpdates } from './auto-update-confirmation';

describe('auto-update-confirmation', () => {
  it('should respond with true when user confirmed the update', async () => {
    sinon.stub(window.e.utils, 'openConsequentialConfirmationDialog').callsFake(config => {
      config.confirm.callback();
    });
    let callBackResponse;
    let eventResponse;
    const fakeEvent = {
      sender: {
        send: (channel, isConfirmed) => {
          eventResponse = { channel, isConfirmed };
        }
      }
    };

    listenForUpdates(isConfirmed => { callBackResponse = isConfirmed; });
    ipcRenderer.emit('confirm-update', fakeEvent, { update: 'info' });
    await nextTick();

    expect(eventResponse).to.eql({
      channel: 'confirm-update-response',
      isConfirmed: true
    });
    expect(callBackResponse).to.eql(true);
  });

  it('should respond with false when user cancelled the update', async () => {
    sinon.stub(window.e.utils, 'openConsequentialConfirmationDialog').callsFake(config => {
      config.cancel.callback();
    });
    let callBackResponse;
    let eventResponse;
    const fakeEvent = {
      sender: {
        send: (channel, isConfirmed) => {
          eventResponse = { channel, isConfirmed };
        }
      }
    };

    listenForUpdates(isConfirmed => { callBackResponse = isConfirmed; });
    ipcRenderer.emit('confirm-update', fakeEvent, { update: 'info' });
    await nextTick();

    expect(eventResponse).to.eql({
      channel: 'confirm-update-response',
      isConfirmed: false
    });
    expect(callBackResponse).to.eql(false);
  });
});

const nextTick = () => new Promise(resolve => setTimeout(resolve, 0));
