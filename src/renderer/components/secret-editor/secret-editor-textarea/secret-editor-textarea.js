import {
  isValidJson,
  isJsonWithErrors,
  getParseErrorMessage,
  minify,
  prettify,
  isJsonMinified
} from '../../../lib/json-helper/json-helper';
import JsonBadge from '../json-badge/json-badge';

export default {
  name: 'secret-editor-textarea',
  template: require('./secret-editor-textarea.html'),
  components: {
    JsonBadge
  },
  props: {
    value: { type: String, required: true, default: '' }
  },
  computed: {
    isValidJson() {
      return isValidJson(this.value);
    },
    isJsonWithErrors() {
      return isJsonWithErrors(this.value);
    },
    getJsonParseErrorMessage() {
      return getParseErrorMessage(this.value);
    }
  },
  methods: {
    changeSecretValue(event) {
      this.$emit('change', event.target.value);
      this.resize();
    },
    async resize() {
      await this.$nextTick();
      this.$refs.textarea.style.height = 'auto';
      this.$refs.textarea.style.height = `${this.$refs.textarea.scrollHeight}px`;
    },
    changeJsonState() {
      if (isJsonMinified(this.value)) {
        this.$emit('change', prettify(this.value));
      } else {
        this.$emit('change', minify(this.value));
      }
    }
  },
  watch: {
    value() {
      this.resize();
    }
  },
  mounted() {
    this.resize();
  }
};
