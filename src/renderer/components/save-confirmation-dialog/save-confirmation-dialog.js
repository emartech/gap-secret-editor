import DifferenceList from '../difference-list/difference-list';
import { isValidJson } from '../../lib/json-helper/json-helper';

export default {
  name: 'save-confirmation-dialog',
  template: require('./save-confirmation-dialog.html'),
  components: { DifferenceList },
  props: {
    originalSecret: Object,
    currentSecret: Object
  },
  data: () => ({
    opened: false
  }),
  computed: {
    hasInvalidatedJson() {
      return Object.keys(this.originalSecret).some(key =>
        isValidJson(this.originalSecret[key]) && this.currentSecret[key] && !isValidJson(this.currentSecret[key])
      );
    },
    hasUntrimmedValue() {
      return Object.values(this.currentSecret).some(value => value !== value.trim());
    }
  },
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
