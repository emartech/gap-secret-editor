import { mount } from '@vue/test-utils';
import SaveConfirmationDialog from './save-confirmation-dialog';

describe('SaveConfirmationDialog', () => {
  describe('#confirm', () => {
    it('should emit confirmed event', () => {
      const wrapper = mount(SaveConfirmationDialog);
      wrapper.vm.confirm();
      expect(wrapper.emitted()).to.eql({ confirmed: [[]] });
    });
  });
});
