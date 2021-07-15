import { mount } from '@vue/test-utils';
import { ipcRenderer } from 'electron';
import flushPromises from 'flush-promises';
import FeedbackDialog from './feedback-dialog';
import notificationDisplayer from '../../lib/notification-displayer';

describe('FeedbackDialog', () => {
  it('should send feedback event to main process when clicking OK button', async () => {
    sinon.stub(ipcRenderer, 'invoke').resolves();
    const wrapper = mount(FeedbackDialog);
    wrapper.find('textarea').setValue('I love this!');

    const okButton = wrapper.find('#feedback-send-button');
    okButton.trigger('click');
    await flushPromises();

    expect(ipcRenderer.invoke).to.have.been.calledWith('send-feedback', 'I love this!');
  });

  it('should clear feedback after successfully sent to main process when clicking OK button', async () => {
    sinon.stub(ipcRenderer, 'invoke').resolves();
    const wrapper = mount(FeedbackDialog);
    wrapper.find('textarea').setValue('I love this!');

    const okButton = wrapper.find('#feedback-send-button');
    okButton.trigger('click');
    await flushPromises();

    expect(wrapper.find('textarea').element.value).to.eql('');
  });

  it('should close dialog when clicking OK button', async () => {
    sinon.stub(ipcRenderer, 'invoke').resolves();
    const wrapper = mount(FeedbackDialog);

    wrapper.vm.open();

    const okButton = wrapper.find('#feedback-send-button');
    okButton.trigger('click');
    await flushPromises();

    expect(wrapper.vm.opened).to.be.false;
  });

  it('should display notification when feedback sending fails', async () => {
    sinon.stub(ipcRenderer, 'invoke').rejects();
    sinon.stub(notificationDisplayer, 'feedbackFailed');

    const wrapper = mount(FeedbackDialog);

    const okButton = wrapper.find('#feedback-send-button');
    okButton.trigger('click');
    await flushPromises();

    expect(notificationDisplayer.feedbackFailed).to.have.been.called;
  });

  it('should close dialog without sending feedback when clicking cancel button', async () => {
    sinon.stub(ipcRenderer, 'invoke');
    const wrapper = mount(FeedbackDialog);
    wrapper.vm.open();

    const cancelButton = wrapper.find('#feedback-cancel-button');
    cancelButton.trigger('click');
    await flushPromises();

    expect(wrapper.vm.opened).to.be.false;
    expect(ipcRenderer.invoke).to.not.have.been.called;
  });
});
