import { mount } from '@vue/test-utils';
import SecretEditorTextarea from './secret-editor-textarea';

describe('SecretEditorTextarea', () => {
  describe('#changeJsonState', () => {
    it('should set jsonState from prettified to minified', () => {
      const wrapper = mount(SecretEditorTextarea, {
        propsData: { value: '[{ "valid_key": "valid_value" }]' },
        data: () => ({ jsonState: 'prettified' })
      });

      wrapper.find('#json-state-switcher').trigger('click');

      expect(wrapper.vm.$data.jsonState).to.eql('minified');
    });

    it('should set jsonState from minified to prettified', () => {
      const wrapper = mount(SecretEditorTextarea, {
        propsData: { value: '[{ "valid_key": "valid_value" }]' },
        data: () => ({ jsonState: 'minified' })
      });

      wrapper.find('#json-state-switcher').trigger('click');

      expect(wrapper.vm.$data.jsonState).to.eql('prettified');
    });

    it('should not change json state when json contains errors', () => {
      const wrapper = mount(SecretEditorTextarea, {
        propsData: { value: '[{ invalid_key: invalid_value" }]' },
        data: () => ({ jsonState: 'minified' })
      });

      wrapper.find('#json-state-switcher-on-error').trigger('click');

      expect(wrapper.vm.$data.jsonState).to.eql('minified');
    });
  });

  describe('#getJsonParseErrorMessage', () => {
    it('should return an error message when json string is invalid', () => {
      const invalidJsonString = '[{ "inv: alid }]';
      const { vm } = mount(SecretEditorTextarea, {
        propsData: { value: invalidJsonString }
      });
      expect(vm.getJsonParseErrorMessage).to.be.eql('Unexpected end of JSON input');
    });

    it('should return another error message when json string is invalid differently', () => {
      const invalidJsonString = '[{ inv: "alid" }]';
      const { vm } = mount(SecretEditorTextarea, {
        propsData: { value: invalidJsonString }
      });
      expect(vm.getJsonParseErrorMessage).to.be.eql('Unexpected token i in JSON at position 3');
    });

    it('should not return anything when json string is valid', () => {
      const validJsonString = '[{ "val": "id" }]';
      const { vm } = mount(SecretEditorTextarea, {
        propsData: { value: validJsonString }
      });
      expect(vm.getJsonParseErrorMessage).to.be.undefined;
    });
  });

  describe('#isJsonWithErrors', () => {
    it('should return true when input seems like a json but it contains errors', () => {
      const invalidJsonString = '[{ "val: "id }]';
      const { vm } = mount(SecretEditorTextarea, {
        propsData: { value: invalidJsonString }
      });
      expect(vm.isJsonWithErrors).to.be.true;
    });

    it('should return true when input starts like a json but it is not a valid one', () => {
      const invalidJsonString = '[{ "not_json" }]';
      const { vm } = mount(SecretEditorTextarea, {
        propsData: { value: invalidJsonString }
      });
      expect(vm.isJsonWithErrors).to.be.true;
    });

    it('should return false when input not starts like a valid json', () => {
      const invalidJsonString = '[ "val": "id" ]';
      const { vm } = mount(SecretEditorTextarea, {
        propsData: { value: invalidJsonString }
      });
      expect(vm.isJsonWithErrors).to.be.false;
    });
  });
});
