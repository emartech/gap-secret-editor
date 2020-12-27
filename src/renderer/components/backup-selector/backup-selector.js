import { format } from 'date-fns';

export default {
  name: 'backup-selector',
  template: require('./backup-selector.html'),
  props: {
    availableTimes: Array,
    selectedTime: String,
    disabled: Boolean
  },
  data: () => ({
    actionlistOpen: false
  }),
  computed: {
    actionlistItems() {
      if (!this.actionlistOpen) return [];

      if (this.availableTimes.length === 0) {
        return [{
          type: 'option',
          content: 'No backups found',
          value: null
        }];
      }

      return this.availableTimes.map(time => ({
        type: 'option',
        content: format(new Date(time), 'yyyy-MM-dd HH:mm:SS'),
        value: time,
        selected: time === this.selectedTime
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
