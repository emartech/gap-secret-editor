import { mount } from '@vue/test-utils';
import Differences from './differences';

describe('Differences', () => {
  describe('#keysOfChangedFields', () => {
    it('should return empty array when nothing changed', () => {
      const originalSecret = { DARTH: 'Vader' };
      const currentSecret = { DARTH: 'Vader' };
      const { vm } = mount(Differences, { propsData: { originalSecret, currentSecret } });

      expect(vm.keysOfChangedFields).to.eql([]);
    });

    it('should return keys of added fields', () => {
      const originalSecret = { HAN: 'Solo' };
      const currentSecret = { DARTH: 'Vader', HAN: 'Solo', LUKE: 'Skywalker' };
      const { vm } = mount(Differences, { propsData: { originalSecret, currentSecret } });

      expect(vm.keysOfChangedFields).to.eql(['DARTH', 'LUKE']);
    });

    it('should return keys of removed fields', () => {
      const originalSecret = { DARTH: 'Vader', HAN: 'Solo', LUKE: 'Skywalker' };
      const currentSecret = { HAN: 'Solo' };
      const { vm } = mount(Differences, { propsData: { originalSecret, currentSecret } });

      expect(vm.keysOfChangedFields).to.eql(['DARTH', 'LUKE']);
    });

    it('should return keys of changed fields', () => {
      const originalSecret = { DARTH: 'Vader', HAN: 'Solo', LUKE: 'Skywalker' };
      const currentSecret = { DARTH: 'Maul', HAN: 'Solo', LUKE: 'Skywalker' };
      const { vm } = mount(Differences, { propsData: { originalSecret, currentSecret } });

      expect(vm.keysOfChangedFields).to.eql(['DARTH']);
    });

    it('should return keys in alphabetical order', () => {
      const originalSecret = { DARTH: 'Vader', HAN: 'Solo', LUKE: 'Skywalker' };
      const currentSecret = { DARTH: 'Maul', HAN: 'Solo', chew: 'bacca' };
      const { vm } = mount(Differences, { propsData: { originalSecret, currentSecret } });

      expect(vm.keysOfChangedFields).to.eql(['chew', 'DARTH', 'LUKE']);
    });
  });
});
