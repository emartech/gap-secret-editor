export default {
  props: {
    value: { type: String, required: true, default: '' },
    highlight: { type: String, default: '' }
  },
  data: () => ({
    editor: null
  }),
  watch: {
    highlight() {
      this.updateHighlights();
    }
  },
  methods: {
    emitChange(newValue) {
      this.$emit('change', newValue);
    },
    setCommonAceEditorSettings(editor) {
      editor.setOptions({
        minLines: 1,
        highlightActiveLine: false,
        cursorStyle: 'slim'
      });

      editor.renderer.setScrollMargin(8, 8, 0, 0);
      editor.renderer.setOptions({
        highlightGutterLine: false
      });

      editor.session.setOptions({
        tabSize: 2,
        useSoftTabs: true,
        navigateWithinSoftTabs: true
      });

      this.editor = editor;
    },
    updateHighlights() {
      if (!this.editor) return;

      const session = this.editor.session;

      Object.keys(session.getMarkers()).forEach(markerId => session.removeMarker(markerId));

      this.editor.$search.setOptions({ needle: this.highlight });
      this.editor.$search.findAll(session).forEach(range => session.addMarker(range, 'searchHighlight', 'text'));
    }
  },
  mounted() {
    this.updateHighlights();
  }
};
