import { mount } from '@vue/test-utils';
import SecretEditorTextarea from './secret-editor-textarea';

describe('SecretEditorTextarea', () => {
  describe('#changeJsonState', () => {
    it('should change JSON formatting from prettified to minified', () => {
      const wrapper = mount(SecretEditorTextarea, {
        propsData: {
          value: `[{\n
          "key": "value"
        \n}]`
        }
      });

      wrapper.find('#badge').trigger('click');

      const lines = _getNumberOfJsonStringLinesAfterSplittingByNewLine(
        wrapper.emitted().change[0][0]
      );
      expect(lines).to.eql(1);
    });

    it('should change JSON formatting from minified to prettified', () => {
      const wrapper = mount(SecretEditorTextarea, {
        propsData: { value: '[{ "key": "value" }]' }
      });

      wrapper.find('#badge').trigger('click');

      const lines = _getNumberOfJsonStringLinesAfterSplittingByNewLine(
        wrapper.emitted().change[0][0]
      );
      expect(lines).to.greaterThan(1);
    });

    it('should not change JSON formatting when value is not a valid JSON', () => {
      const value = '{ "key": "value", "key-without-value" }';
      const wrapper = mount(SecretEditorTextarea, {
        propsData: { value }
      });

      wrapper.find('#badge').trigger('click');

      expect(wrapper.emitted()).to.eql({});
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
      const invalidJsonString = '] "val": "id" ]';
      const { vm } = mount(SecretEditorTextarea, {
        propsData: { value: invalidJsonString }
      });
      expect(vm.isJsonWithErrors).to.be.false;
    });
  });
});

const _getNumberOfJsonStringLinesAfterSplittingByNewLine = (jsonString) => {
  return jsonString.split('\n').length;
};
