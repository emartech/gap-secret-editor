import { mount } from '@vue/test-utils';

export const mountWithFakeAceEditor = (component, options = {}) => {
  return mount(component, {
    ...options,
    stubs: {
      AceEditor: {
        template: '<textarea :value="value" @input="$emit(\'input\', $event.target.value)"></textarea>',
        props: { value: String }
      }
    }
  });
};
