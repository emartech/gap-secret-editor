import AceEditor from 'vue2-ace-editor';
import { looksLikeJson } from '../../../lib/json-helper/json-helper';
import EditorBase from '../editor-base';
import JsonFormatButton from './json-format-button/json-format-button';

require('brace/theme/github');
require('brace/mode/text');
require('brace/mode/json');

export default {
  name: 'value-editor',
  template: require('./value-editor.html'),
  mixins: [EditorBase],
  components: { AceEditor, JsonFormatButton },
  data: () => ({
    editorHoovered: false,
    toolbarHovered: false
  }),
  computed: {
    editorLanguage() {
      return looksLikeJson(this.value) ? 'json' : 'text';
    },
    toolbarOpacity() {
      return this.toolbarHovered ? 1 : (this.editorHoovered ? 0.3 : 0);
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
