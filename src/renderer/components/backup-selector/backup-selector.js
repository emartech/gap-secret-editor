import { format } from 'date-fns';
import ChangeViewerDialog from '../change-viewer-dialog/change-viewer-dialog';

export default {
  name: 'backup-selector',
  template: require('./backup-selector.html'),
  components: { ChangeViewerDialog },
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
      const selectedBackupIndex = this.backups.findIndex(item => item.backupTime === backup.backupTime);
      const secretBefore = selectedBackupIndex === this.backups.length - 1
        ? {}
        : this.backups[selectedBackupIndex + 1].data;

      this.$refs.changeViewerDialog.displayChange({
        time: backup.backupTime,
        secretAfter: backup.data,
        secretBefore
      });
    }
  }
};
