import { format } from 'date-fns';
import ChangeHistoryDialog from '../change-history-dialog/change-history-dialog';

export default {
  name: 'backup-selector',
  template: require('./backup-selector.html'),
  components: { ChangeHistoryDialog },
  props: {
    backups: Array,
    selectedTime: String,
    disabled: Boolean
  },
  data: () => ({
    hoveredOptionId: ''
  }),
  computed: {
    availableBackupTimes() {
      return this.backups.map(backup => backup.backupTime);
    },
    options() {
      return this.backups.map(backup => ({
        backup,
        id: backup.backupTime,
        displayedTime: format(new Date(backup.backupTime), 'yyyy-MM-dd HH:mm:SS'),
        selected: backup.backupTime === this.selectedTime
      }));
    }
  },
  methods: {
    mousEnterItem(id) {
      this.hoveredOptionId = id;
    },
    mouseLeveItem() {
      this.hoveredOptionId = '';
    },
    selectBackup(backup) {
      this.$emit('input', backup);
    },
    viewBackup(backup) {
      this.$refs.changeHistoryDialog.displayChange(backup.backupTime);
    }
  }
};
