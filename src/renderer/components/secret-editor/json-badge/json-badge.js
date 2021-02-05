import {
  getParseErrorMessage,
  isJsonMinified,
  isJsonWithErrors,
  isValidJson,
  looksLikeJson,
  minify,
  prettify
} from '../../../lib/json-helper/json-helper';

export default {
  name: 'json-badge',
  template: require('./json-badge.html'),
  props: {
    text: { type: String, default: '' }
  },
  computed: {
    style() {
      return `position: absolute; top: 7px; right: 0; cursor: ${
        this.isJsonWithErrors ? 'default' : 'pointer'
      }`;
    },
    type() {
      return this.isJsonWithErrors ? 'danger' : 'info';
    },
    looksLikeJson() {
      return looksLikeJson(this.text);
    },
    isJsonWithErrors() {
      return isJsonWithErrors(this.text);
    },
    getJsonParseErrorMessage() {
      return getParseErrorMessage(this.text);
    }
  },
  methods: {
    changeJsonState() {
      if (isValidJson(this.text)) {
        if (isJsonMinified(this.text)) {
          this.$emit('change-json-state', prettify(this.text));
        } else {
          this.$emit('change-json-state', minify(this.text));
        }
      }
    }
  }
};
