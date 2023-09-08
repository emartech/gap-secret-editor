import { mount } from '@vue/test-utils';
import JsonFormatButton from './trim-button';

describe('TrimButton', () => {
  describe('#trim', () => {
    it('should trim the given text', () => {
      const wrapper = mount(JsonFormatButton, {
        propsData: {
          text: ' Gummi Bears '
        }
      });

      wrapper.find('.e-btn').trigger('click');

      const emitted = wrapper.emitted().trim[0][0];
      expect(emitted).to.eql('Gummi Bears');
    });
  });
});
