import { mapState } from 'vuex';

require('brace/theme/github');
require('brace/theme/tomorrow_night');
require('brace/mode/text');
require('brace/mode/json');

export default {
  props: {
    value: { type: String, required: true, default: '' },
    highlight: { type: String, default: '' }
  },
  data: () => ({
    editor: null
  }),
  computed: {
    ...mapState(['isDarkModeActive']),
    editorTheme() {
      return this.isDarkModeActive ? 'tomorrow_night' : 'github';
    }
  },
  watch: {
    async value() {
      await this.updateHighlights();
    },
    async highlight() {
      await this.updateHighlights();
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
        cursorStyle: 'slim',
        showPrintMargin: false
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
    async updateHighlights() {
      if (!this.editor) return;

      await this.$nextTick();
      const session = this.editor.session;

      Object.keys(session.getMarkers()).forEach(markerId => session.removeMarker(markerId));

      this.editor.$search.setOptions({ needle: this.highlight });
      this.editor.$search.findAll(session).forEach(range => session.addMarker(range, 'searchHighlight', 'text'));
    }
  },
  async mounted() {
    await this.updateHighlights();
  }
};
