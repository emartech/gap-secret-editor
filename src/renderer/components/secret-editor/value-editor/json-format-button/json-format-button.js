import { isJsonMinified, isValidJson, minify, prettify } from '../../../../lib/json-helper/json-helper';

export default {
  name: 'json-format-button',
  template: require('./json-format-button.html'),
  props: {
    text: { type: String, default: '' }
  },
  computed: {
    isValidJson() {
      return isValidJson(this.text);
    },
    isJsonMinified() {
      return isJsonMinified(this.text);
    },
    tooltip() {
      if (!this.isValidJson) return 'Invalid JSON';
      return this.isJsonMinified ? 'Prettify JSON' : 'Minify JSON';
    }
  },
  methods: {
    changeJsonState() {
      if (this.isValidJson) {
        if (this.isJsonMinified) {
          this.$emit('change-json-state', prettify(this.text));
        } else {
          this.$emit('change-json-state', minify(this.text));
        }
      }
    }
  }
};

