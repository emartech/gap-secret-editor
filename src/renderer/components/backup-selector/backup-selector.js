import { format } from 'date-fns';

export default {
  name: 'backup-selector',
  template: require('./backup-selector.html'),
  props: {
    backups: Array,
    disabled: Boolean
  },
  data: () => ({
    actionlistOpen: false,
    readonly: false
  }),
  computed: {
    actionlistItems() {
      if (!this.actionlistOpen) return [];

      if (this.backups.length === 0) {
        return [{
          type: 'option',
          content: 'No backups found',
          value: null
        }];
      }

      return this.backups.map(backup => ({
        type: 'option',
        content: format(new Date(backup.backupTime), 'yyyy-MM-dd HH:mm:SS'),
        value: backup.data
      }));
    }
  },
  methods: {
    async onActionlistChange(value) {
      if (value) {
        this.$emit('input', value);
      }
      this.actionlistOpen = false;
    },
    onPopoverClose() {
      this.actionlistOpen = false;
    },
    onPopoverOpen() {
      this.actionlistOpen = true;
      this.$refs.actionlist.value = null;
      this.$refs.popoverHandler.update();
    }
  },
  mounted() {
    this.$refs.popoverHandler.popover = this.$refs.actionlist;
  }
};
