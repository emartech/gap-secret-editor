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
  methods: {
    setCursorByType(type) {
      return type === 'info' ? 'pointer' : 'default';
    }
  }
};
