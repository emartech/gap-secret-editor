import Vue from 'vue';
import createDOMPurify from 'dompurify';

export default () => {
  const DOMPurify = createDOMPurify();
  const config = { ADD_TAGS: ['e-icon'], ADD_ATTR: ['icon'] };

  Vue.directive('safe-html', {
    inserted(element, { value }) {
      element.innerHTML = DOMPurify.sanitize(value, config);
    },
    update(element, { value }) {
      element.innerHTML = DOMPurify.sanitize(value, config);
    }
  });
};
