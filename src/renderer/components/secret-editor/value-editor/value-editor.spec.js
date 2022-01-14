import flushPromises from 'flush-promises';
import { mountWithStore } from '../../../../../test-helpers/mount-helpers';
import createStore from '../../../store/store';
import ValueEditor from './value-editor';

describe('ValueEditor', () => {
  describe('#editorLanguage', () => {
    it('should return json when value looks like a json', () => {
      const { vm } = mountWithStore(ValueEditor, { propsData: { value: '{"some":"thing"}' } });
      expect(vm.editorLanguage).to.eql('json');
    });

    it('should return text when value does not look like a json', () => {
      const { vm } = mountWithStore(ValueEditor, { propsData: { value: 'something' } });
      expect(vm.editorLanguage).to.eql('text');
    });
  });

  describe('#editorTheme', () => {
    it('should return dark theme if dark mode is active', () => {
      const { vm } = mountWithStore(ValueEditor, { propsData: { value: '{"some":"thing"}' } });
      vm.$store.state.isDarkModeActive = true;

      expect(vm.editorTheme).to.eql('tomorrow_night');
    });

    it('should return light theme if dark mode is inactive', () => {
      const { vm } = mountWithStore(ValueEditor, { propsData: { value: '{"some":"thing"}' } });
      vm.$store.state.isDarkModeActive = false;

      expect(vm.editorTheme).to.eql('github');
    });
  });

  describe('toolbar buttons', () => {
    it('should emit change event when a JSON field is minified', () => {
      const wrapper = mountWithStore(ValueEditor, { propsData: { value: '{\n"some":"thing"\n}' } });
      wrapper.find('.editor-toolbar .json-format .e-btn').trigger('click');
      expect(wrapper.emitted()).to.eql({ change: [['{"some":"thing"}']] });
    });

    it('should emit change event when a field backup is loaded', async () => {
      const store = createStore();
      store.commit('setBackups', [
        { backupTime: '2020-12-24T01:00:00.000Z', data: { FIELD: 'something' } },
        { backupTime: '2020-12-24T00:00:00.000Z', data: { FIELD: 'something else' } }
      ]);
      const wrapper = mountWithStore(ValueEditor, { store, propsData: { value: 'something', fieldKey: 'FIELD' } });

      await clickButton(wrapper, '.editor-toolbar .change-history .e-btn');
      await changeSelectValue(wrapper, '.editor-toolbar .change-history e-dialog e-select', '2020-12-24T00:00:00.000Z');
      await clickButton(wrapper, '.editor-toolbar .change-history e-dialog .e-btn');

      expect(wrapper.emitted()).to.eql({ change: [['something else']] });
    });
  });
});

const changeSelectValue = async (wrapper, selector, value) => {
  const namespaceSelector = wrapper.find(selector);
  namespaceSelector.element.value = value;
  namespaceSelector.trigger('change');
  await flushPromises();
  await wrapper.vm.$nextTick();
};

const clickButton = async (wrapper, selector) => {
  wrapper.find(selector).trigger('click');
  await flushPromises();
};
