import Vue from 'vue';
import createDOMPurify from 'dompurify';

export default () => {
  const DOMPurify = createDOMPurify();
  Vue.directive('safe-html', {
    inserted(element, { value }) {
      element.innerHTML = DOMPurify.sanitize(value);
    },
    update(element, { value }) {
      element.innerHTML = DOMPurify.sanitize(value);
    }
  });
};
