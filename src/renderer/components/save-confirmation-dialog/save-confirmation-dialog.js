export default {
  name: 'save-confirmation-dialog',
  template: require('./save-confirmation-dialog.html'),
  data: () => ({
    opened: false
  }),
  methods: {
    open() {
      this.opened = true;
    },
    close() {
      this.opened = false;
    },
    confirm() {
      this.$emit('confirmed');
    }
  }
};
