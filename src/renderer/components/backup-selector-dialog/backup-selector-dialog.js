export default {
  name: 'backup-selector',
  template: require('./backup-selector-dialog.html'),
  props: {
    opened: { type: Boolean, default: () => false },
    secretName: { type: String, required: true }
  },
  computed: {
  },
  methods: {
    close() {
      this.$refs.dialog.close();
    },
    onClose() {
      console.log('closed');
    }
  }
};
