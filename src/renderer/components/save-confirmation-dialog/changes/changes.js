import { diffLines } from 'diff';
import { zip } from 'lodash';

export default {
  name: 'changes',
  template: require('./changes.html'),
  props: {
    originalValue: String,
    currentValue: String
  },
  computed: {
    isDeleted() {
      return this.originalValue && !this.currentValue;
    },
    lines() {
      const differences = diffLines(this.originalValue || '', this.currentValue || '');

      const lines = [];

      for (let i = 0; i < differences.length; i++) {
        const diffBlock = differences[i];
        const linesInBlock = diffBlock.value.split('\n', diffBlock.count);
        const nextBlock = differences[i + 1];

        if (diffBlock.added) {
          linesInBlock.forEach(line => lines.push({ left: undefined, right: line }));
        } else if (diffBlock.removed) {
          if (nextBlock && nextBlock.added) {
            const linesInNextBlock = nextBlock.value.split('\n', nextBlock.count);
            const linesInBothBlock = zip(linesInBlock, linesInNextBlock);
            linesInBothBlock.forEach(([removed, added]) => lines.push({ left: removed, right: added }));
            i++;
          } else {
            linesInBlock.forEach(line => lines.push({ left: line, right: undefined }));
          }
        } else {
          linesInBlock.forEach(line => lines.push({ left: line, right: line }));
        }
      }

      return lines;
    }
  }
};
