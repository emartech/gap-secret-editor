import { mount } from '@vue/test-utils';
import JsonFormatButton from './json-format-button';

describe('JsonFormatButton', () => {
  describe('#tooltip', () => {
    it('should return prettify text when string is a minified JSON', () => {
      const { vm } = mount(JsonFormatButton, {
        propsData: {
          text: '[{"key":"value"}]'
        }
      });

      expect(vm.tooltip).to.eql('Prettify JSON');
    });

    it('should return minify text when string is a prettified JSON', () => {
      const { vm } = mount(JsonFormatButton, {
        propsData: {
          text: '[{\n "key": "value" \n}]'
        }
      });

      expect(vm.tooltip).to.eql('Minify JSON');
    });

    it('should return invalid text when string is not a valid JSON', () => {
      const { vm } = mount(JsonFormatButton, {
        propsData: {
          text: '[{"key": "value", "key-without-value"}]'
        }
      });

      expect(vm.tooltip).to.eql('Invalid JSON');
    });
  });

  describe('#changeJsonState', () => {
    it('should change JSON formatting from prettified to minified', () => {
      const wrapper = mount(JsonFormatButton, {
        propsData: {
          text: '[{\n "key": "value" \n}]'
        }
      });

      wrapper.find('.e-btn').trigger('click');

      const minified = wrapper.emitted()['change-json-state'][0][0];
      expect(minified).to.eql('[{"key":"value"}]');
    });

    it('should change JSON formatting from minified to prettified', () => {
      const longValue = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
      const wrapper = mount(JsonFormatButton, {
        propsData: { text: `{"a":"${longValue}","b":"${longValue}"}` }
      });

      wrapper.find('.e-btn').trigger('click');

      const formatted = wrapper.emitted()['change-json-state'][0][0];
      expect(formatted).to.eql(`{\n  "a": "${longValue}",\n  "b": "${longValue}"\n}`);
    });

    it('should not change JSON formatting when value is not a valid JSON', () => {
      const text = '{ "key": "value", "key-without-value" }';
      const wrapper = mount(JsonFormatButton, {
        propsData: { text }
      });

      wrapper.find('.e-btn').trigger('click');

      expect(wrapper.emitted()).to.eql({});
    });
  });
});
