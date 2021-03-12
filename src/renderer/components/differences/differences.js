import { difference, intersection, keys } from 'lodash';
import Difference from './difference/difference';

export default {
  name: 'differences',
  template: require('./differences.html'),
  components: { Difference },
  props: {
    originalSecret: Object,
    currentSecret: Object
  },
  computed: {
    keysOfChangedFields() {
      const originalKeys = keys(this.originalSecret);
      const currentKeys = keys(this.currentSecret);

      const changedFieldKeys = [
        ...difference(currentKeys, originalKeys),
        ...difference(originalKeys, currentKeys),
        ...intersection(originalKeys, currentKeys).filter(
          key => this.originalSecret[key] !== this.currentSecret[key]
        )
      ];
      return changedFieldKeys.sort((first, second) =>
        first.toUpperCase().localeCompare(second.toUpperCase())
      );
    }
  }
};
