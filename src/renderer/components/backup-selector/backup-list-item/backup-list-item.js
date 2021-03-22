export default {
  name: 'backup-list-item',
  template: require('./backup-list-item.html'),
  props: {
    selected: Boolean,
    time: String
  },
  data: () => ({
    hovered: false
  }),
  methods: {
    mouseEnter() {
      this.hovered = true;
    },
    mouseLeave() {
      this.hovered = false;
    }
  }
};
