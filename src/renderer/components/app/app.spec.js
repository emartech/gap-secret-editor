import { shallowMount } from '@vue/test-utils';
import App from './app';

describe('App', () => {
  describe('#sayHello', () => {
    it('should say hello', () => {
      const { vm } = shallowMount(App);
      expect(vm.sayHello('Tim')).to.eql('Hello Tim!');
    });
  });
});
