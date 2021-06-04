import { mapState } from 'vuex';
import { get, pick } from 'lodash';
import ChangeHistoryDialog from '../../../change-history-dialog/change-history-dialog';

export default {
  name: 'change-history-button',
  template: require('./change-history-button.html'),
  components: { ChangeHistoryDialog },
  props: {
    fieldKey: String
  },
  computed: {
    ...mapState(['backups']),
    fieldBackups() {
      const backupsWithOnlyRelevantField = this.backups
        .map(backup => ({ backupTime: backup.backupTime, data: pick(backup.data, this.fieldKey) }));

      return backupsWithOnlyRelevantField.reduceRight((acc, backup) => {
        const fieldValue = backup.data[this.fieldKey];
        const previousFieldValue = get(acc, `[0].data[${this.fieldKey}]`);
        return [
          ...(fieldValue === previousFieldValue ? [] : [backup]),
          ...acc
        ];
      }, []);
    }
  },
  methods: {
    openChangeHistoryDialog() {
      this.$refs.changeHistoryDialog.displayChange(this.fieldBackups[0].backupTime);
    },
    selectBackup(backup) {
      console.log('backup selected', backup);
    }
  }
};
