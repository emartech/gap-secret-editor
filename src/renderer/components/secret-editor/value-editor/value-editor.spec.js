import { mount } from '@vue/test-utils';
import ValueEditor from './value-editor';

describe('ValueEditor', () => {
  describe('#editorLanguage', () => {
    it('should return json when value looks like a json', () => {
      const { vm } = mount(ValueEditor, { propsData: { value: '{"some":"thing"}' } });
      expect(vm.editorLanguage).to.eql('json');
    });

    it('should return text when value does not look like a json', () => {
      const { vm } = mount(ValueEditor, { propsData: { value: 'something' } });
      expect(vm.editorLanguage).to.eql('text');
    });
  });
});
