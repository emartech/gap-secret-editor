import AceEditor from 'vue2-ace-editor';
import JsonBadge from '../json-badge/json-badge';
import { looksLikeJson } from '../../../lib/json-helper/json-helper';
import EditorBase from '../editor-base';

require('brace/theme/github');
require('brace/mode/text');
require('brace/mode/json');

export default {
  name: 'value-editor',
  template: require('./value-editor.html'),
  mixins: [EditorBase],
  components: { AceEditor, JsonBadge },
  computed: {
    editorLanguage() {
      return looksLikeJson(this.value) ? 'json' : 'text';
    }
  },
  methods: {
    initEditor(editor) {
      this.setCommonAceEditorSettings(editor);
      editor.setOptions({
        maxLines: 30
      });
    }
  },
  mounted() {
    if (this.editor) {
      this.editor.gotoLine(0, 0);
    }
  }
};
