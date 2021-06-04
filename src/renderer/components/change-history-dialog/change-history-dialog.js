import { format } from 'date-fns';
import DifferenceList from '../difference-list/difference-list';

export default {
  name: 'change-history-dialog',
  template: require('./change-history-dialog.html'),
  components: { DifferenceList },
  props: {
    backups: Array
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
      this.secretBefore =
        selectedBackupIndex === this.backups.length - 1
          ? {}
          : this.backups[selectedBackupIndex + 1].data;
      this.secretAfter = this.backups[selectedBackupIndex].data;
    },
    loadToEditor() {
      const selectedBackup = this.backups.find(
        backup => backup.backupTime === this.selectedModificationTime
      );
      this.$emit('load-backup', selectedBackup);
      this.close();
    },
    close() {
      this.opened = false;
    }
  }
};
