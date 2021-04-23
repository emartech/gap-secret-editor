import { mount } from '@vue/test-utils';
import Difference from './difference';

describe('Difference', () => {
  describe('#changeType', () => {
    it('should return CHANGED when both original and current values are given but they differ', () => {
      const { vm } = mount(Difference, { propsData: { originalValue: 'pizza', currentValue: 'burger' } });
      expect(vm.changeType).to.eql('CHANGED');
    });

    it('should return REMOVED when only original value is given', () => {
      const { vm } = mount(Difference, { propsData: { originalValue: 'pizza', currentValue: null } });
      expect(vm.changeType).to.eql('REMOVED');
    });

    it('should return ADDED when only current value is given', () => {
      const { vm } = mount(Difference, { propsData: { originalValue: null, currentValue: 'burger' } });
      expect(vm.changeType).to.eql('ADDED');
    });
  });
});
