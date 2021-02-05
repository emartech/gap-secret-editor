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
  methods: {
    changeSecretValue(newValue) {
      this.$emit('change', newValue);
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
