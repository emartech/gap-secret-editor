import { mount } from '@vue/test-utils';
import SaveConfirmationDialog from './save-confirmation-dialog';

describe('SaveConfirmationDialog', () => {
  describe('#hasInvalidatedJson', () => {
    it('should return false when JSON validity does not change', () => {
      const { vm } = mount(SaveConfirmationDialog, {
        propsData: {
          originalSecret: { someJson: '{"key":"value"}', someOther: 'something' },
          currentSecret: { someJson: '{"key":"other value"}', someOther: 'something else' }
        }
      });

      expect(vm.hasInvalidatedJson).to.be.false;
    });

    it('should return true when valid JSON becomes invalid', () => {
      const { vm } = mount(SaveConfirmationDialog, {
        propsData: {
          originalSecret: { someJson: '{"key":"value"}', someOther: 'something' },
          currentSecret: { someJson: '{"key-without-value"}', someOther: 'something else' }
        }
      });

      expect(vm.hasInvalidatedJson).to.be.true;
    });

    it('should return false when valid JSON is removed', () => {
      const { vm } = mount(SaveConfirmationDialog, {
        propsData: {
          originalSecret: { someJson: '{"key":"value"}', someOther: 'something' },
          currentSecret: { someOther: 'something else' }
        }
      });

      expect(vm.hasInvalidatedJson).to.be.false;
    });
  });

  describe('#confirm', () => {
    it('should emit confirmed event', () => {
      const wrapper = mount(SaveConfirmationDialog, { propsData: { originalSecret: {}, currentSecret: {} } });
      wrapper.vm.confirm();
      expect(wrapper.emitted()).to.eql({ confirmed: [[]] });
    });
  });
});
