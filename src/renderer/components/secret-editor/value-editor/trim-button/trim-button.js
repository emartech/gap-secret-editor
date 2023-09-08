export default {
  name: 'trim-button',
  template: require('./trim-button.html'),
  props: {
    text: { type: String, default: '' }
  },
  methods: {
    trim() {
      this.$emit('trim', this.text.trim());
    }
  }
};
