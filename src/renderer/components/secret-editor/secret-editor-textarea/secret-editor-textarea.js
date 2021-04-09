import AceEditor from 'vue2-ace-editor';
import JsonBadge from '../json-badge/json-badge';
import { looksLikeJson } from '../../../lib/json-helper/json-helper';

require('brace/theme/github');
require('brace/mode/text');
require('brace/mode/json');

export default {
  name: 'secret-editor-textarea',
  template: require('./secret-editor-textarea.html'),
  components: { AceEditor, JsonBadge },
  data: () => ({
    editor: null
  }),
  props: {
    value: { type: String, required: true, default: '' }
  },
  computed: {
    editorLanguage() {
      return looksLikeJson(this.value) ? 'json' : 'text';
    }
  },
  methods: {
    changeSecretValue(newValue) {
      this.$emit('change', newValue);
    },
    initEditor(editor) {
      editor.setOptions({
        minLines: 1,
        maxLines: 30,
        highlightActiveLine: false
      });
      editor.renderer.setScrollMargin(8, 8, 0, 0);
      editor.renderer.setOptions({
        highlightGutterLine: false
        // showInvisibles: true
      });
      editor.session.setOptions({
        tabSize: 2,
        useSoftTabs: true,
        navigateWithinSoftTabs: true
      });

      this.editor = editor;
    }
  },
  mounted() {
    if (this.editor) {
      this.editor.gotoLine(0, 0);
    }
  }
};
