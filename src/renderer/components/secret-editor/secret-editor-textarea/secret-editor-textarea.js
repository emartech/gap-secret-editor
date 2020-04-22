import isValidJson from '../../../lib/is-valid-json';

export default {
  name: 'secret-editor-textarea',
  template: require('./secret-editor-textarea.html'),
  props: {
    value: { type: String, required: true, default: '' }
  },
  computed: {
    isValidJson() {
      return isValidJson(this.value);
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
