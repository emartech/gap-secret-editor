import {
  isValidJson,
  isJsonWithErrors,
  isJsonPrettified,
  getParseErrorMessage,
  minify,
  prettify,
  states
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
  data: () => ({
    jsonState: states.DEFAULT
  }),
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
      if (isJsonPrettified(this.jsonState)) {
        this.$emit('change', minify(this.value));
        this.jsonState = states.MINIFIED;
      } else {
        this.$emit('change', prettify(this.value));
        this.jsonState = states.PRETTIFIED;
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
