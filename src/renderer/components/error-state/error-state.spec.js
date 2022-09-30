import { mount } from '@vue/test-utils';
import { ipcRenderer } from 'electron';
import ErrorState from './error-state';

describe('ErrorState', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should clear local storage and send restart message to main process when restart button clicked', async () => {
    localStorage.monkey = 'banana';
    sinon.stub(ipcRenderer, 'send');
    const wrapper = mount(ErrorState);

    await wrapper.find('.e-btn-primary').trigger('click');

    expect(localStorage.monkey).to.be.undefined;
    expect(ipcRenderer.send).to.have.been.calledWith('restart');
  });
});
