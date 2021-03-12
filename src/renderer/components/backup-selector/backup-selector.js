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
    hoveredTime: ''
  }),
  computed: {
    options() {
      if (this.availableTimes.length === 0) {
        return [{ displayedTime: 'No backups found' }];
      }
      return this.availableTimes.map(time => ({
        time,
        displayedTime: format(new Date(time), 'yyyy-MM-dd HH:mm:SS'),
        selected: time === this.selectedTime
      }));
    }
  },
  methods: {
    mousEnterItem(time) {
      this.hoveredTime = time;
    },
    mouseLeveItem() {
      this.hoveredTime = '';
    },
    selectBackup(time) {
      this.$emit('input', time);
    },
    viewBackup(time) {
      const sortedTimes = this.availableTimes.sort();
      const timeIndex = sortedTimes.findIndex(option => option === time);
      this.$emit('preview-backup', {
        modificationTime: time,
        lastModificationBefore: timeIndex === 0 ? null : sortedTimes[timeIndex - 1]
      });
    }
  }
};
