import { format } from 'date-fns';
import Differences from '../differences/differences';

export default {
  name: 'change-viewer-dialog',
  template: require('./change-viewer-dialog.html'),
  components: { Differences },
  props: {
    originalSecret: Object,
    currentSecret: Object
  },
  data: () => ({
    opened: false,
    secretBefore: {},
    secretAfter: {},
    time: ''
  }),
  computed: {
    headline() {
      return this.time
        ? `Changes made on ${format(new Date(this.time), 'yyyy-MM-dd HH:mm:SS')}`
        : '';
    }
  },
  methods: {
    displayChange({ secretBefore, secretAfter, time }) {
      this.opened = true;
      this.secretBefore = secretBefore;
      this.secretAfter = secretAfter;
      this.time = time;
    },
    close() {
      this.opened = false;
    }
  }
};
