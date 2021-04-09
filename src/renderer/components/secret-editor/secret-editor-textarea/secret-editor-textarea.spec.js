import { mount } from '@vue/test-utils';
import SecretEditorTextarea from './secret-editor-textarea';

describe('SecretEditorTextarea', () => {
  describe('#editorLanguage', () => {
    it('should return json when value looks like a json', () => {
      const { vm } = mount(SecretEditorTextarea, { propsData: { value: '{"some":"thing"}' } });
      expect(vm.editorLanguage).to.eql('json');
    });

    it('should return text when value does not look like a json', () => {
      const { vm } = mount(SecretEditorTextarea, { propsData: { value: 'something' } });
      expect(vm.editorLanguage).to.eql('text');
    });
  });
});
