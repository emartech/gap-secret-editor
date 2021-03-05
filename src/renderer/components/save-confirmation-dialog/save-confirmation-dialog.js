import { difference, intersection, isNil, keys } from 'lodash';
import { createPatch } from 'diff';
import * as Diff2Html from 'diff2html';

export default {
  name: 'save-confirmation-dialog',
  template: require('./save-confirmation-dialog.html'),
  props: {
    originalSecret: Object,
    currentSecret: Object
  },
  data: () => ({
    opened: false
  }),
  computed: {
    keysOfChangedFields() {
      const originalKeys = keys(this.originalSecret);
      const currentKeys = keys(this.currentSecret);

      const changedFieldKeys = [
        ...difference(currentKeys, originalKeys),
        ...difference(originalKeys, currentKeys),
        ...intersection(originalKeys, currentKeys).filter(key => this.originalSecret[key] !== this.currentSecret[key])
      ];
      return changedFieldKeys
        .sort((first, second) => first.toUpperCase().localeCompare(second.toUpperCase()));
    }
  },
  methods: {
    difference(key) {
      const changeType = !isNil(this.originalSecret[key]) && !isNil(this.currentSecret[key])
        ? 'CHANGED'
        : isNil(this.originalSecret[key])
          ? 'ADDED'
          : 'REMOVED';

      const patch = createPatch(key, this.originalSecret[key] || '', this.currentSecret[key] || '');
      const diffJson = Diff2Html.parse(patch);
      return Diff2Html.html(diffJson, {
        drawFileList: false,
        matching: 'lines',
        outputFormat: 'side-by-side',
        rawTemplates: {
          'generic-file-path':
            `<span>${key}</span><span class="e-padding-left-l text-color-gray-400">${changeType}</span>`
        }
      });
    },
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
