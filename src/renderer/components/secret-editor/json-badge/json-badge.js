export default {
  name: 'json-badge',
  template: require('./json-badge.html'),
  props: {
    id: { type: String, default: '' },
    type: { type: String, default: 'info' },
    content: { type: String, default: 'JSON' },
    tooltipText: { type: String | null, default: null },
    onClick: { type: Function, default: (e) => e.preventDefault() }
  },
  computed: {
    defaultClass() {
      return `e-label e-label-${this.type}`;
    },
    defaultStyle() {
      return `position: absolute; top: 7px; right: 0; cursor: ${
        this.type === 'info' ? 'pointer' : 'default'
      }`;
    },
    tooltipDisabled() {
      return !this.tooltipText;
    }
  }
};
