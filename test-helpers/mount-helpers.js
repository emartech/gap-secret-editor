import { mount, shallowMount } from '@vue/test-utils';
import createStore from '../src/renderer/store/store';

export const mountWithFakeAceEditor = (component, options = {}) => {
  return mount(component, {
    store: createStore(),
    ...options,
    stubs: {
      AceEditor: {
        template: '<textarea :value="value" @input="$emit(\'input\', $event.target.value)"></textarea>',
        props: { value: String }
      }
    }
  });
};

export const mountWithFakeLazyComponent = (component, options = {}) => {
  return mount(component, {
    store: createStore(),
    ...options,
    stubs: {
      LazyComponent: {
        template: '<div><slot v-if="shouldRender"></slot><slot v-else name="placeholder"></slot></div>',
        props: { isIntersected: Boolean },
        data() {
          return {
            shouldRender: this.isIntersected
          };
        },
        methods: {
          handleBecomingVisible() {
            this.shouldRender = true;
          }
        }
      }
    }
  });
};

export const mountWithStore = (component, options = {}) => {
  return mount(component, { store: createStore(), ...options });
};

export const shallowMountWithStore = (component, options = {}) => {
  return shallowMount(component, { store: createStore(), ...options });
};
