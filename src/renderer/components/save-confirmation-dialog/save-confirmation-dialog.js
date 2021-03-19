import Differences from '../differences/differences';

export default {
  name: 'save-confirmation-dialog',
  template: require('./save-confirmation-dialog.html'),
  components: { Differences },
  props: {
    originalSecret: Object,
    currentSecret: Object
  },
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
