import { format } from 'date-fns';
import Differences from '../differences/differences';

export default {
  name: 'change-history-dialog',
  template: require('./change-history-dialog.html'),
  components: { Differences },
  props: {
    backups: Array,
    originalSecret: Object,
    currentSecret: Object
  },
  data: () => ({
    opened: false,
    selectedModificationTime: '',
    secretBefore: {},
    secretAfter: {}
  }),
  computed: {
    modificationTimeOptions() {
      return this.backups.map(backup => ({
        type: 'option',
        content: format(new Date(backup.backupTime), 'yyyy-MM-dd HH:mm:SS'),
        value: backup.backupTime,
        selected: backup.backupTime === this.selectedModificationTime
      }));
    }
  },
  methods: {
    displayChange(backupTime) {
      this.opened = true;
      this.selectedModificationTime = backupTime;

      const selectedBackupIndex = this.backups.findIndex(item => item.backupTime === backupTime);
      this.secretBefore = selectedBackupIndex === this.backups.length - 1
        ? {}
        : this.backups[selectedBackupIndex + 1].data;
      this.secretAfter = this.backups[selectedBackupIndex].data;
    },
    close() {
      this.opened = false;
    }
  }
};
