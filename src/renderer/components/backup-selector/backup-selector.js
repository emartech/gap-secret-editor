import { format } from 'date-fns';
import ChangeHistoryDialog from '../change-history-dialog/change-history-dialog';
import BackupListItem from './backup-list-item/backup-list-item';

export default {
  name: 'backup-selector',
  template: require('./backup-selector.html'),
  components: {
    BackupListItem,
    ChangeHistoryDialog
  },
  props: {
    backups: Array,
    selectedTime: String,
    disabled: Boolean
  },
  computed: {
    options() {
      return this.backups.map(backup => ({
        backup,
        id: backup.backupTime,
        displayedTime: format(new Date(backup.backupTime), 'yyyy-MM-dd HH:mm:ss'),
        selected: backup.backupTime === this.selectedTime
      }));
    }
  },
  methods: {
    selectBackup(backup) {
      this.$emit('input', backup);
    },
    viewBackup(backup) {
      this.$refs.changeHistoryDialog.displayChange(backup.backupTime);
    }
  }
};
