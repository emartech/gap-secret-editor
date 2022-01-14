import AceEditor from 'vue2-ace-editor';
import { looksLikeJson } from '../../../lib/json-helper/json-helper';
import EditorBase from '../editor-base';
import JsonFormatButton from './json-format-button/json-format-button';
import ChangeHistoryButton from './change-history-button/change-history-button';

export default {
  name: 'value-editor',
  template: require('./value-editor.html'),
  mixins: [EditorBase],
  components: { AceEditor, JsonFormatButton, ChangeHistoryButton },
  props: {
    fieldKey: String
  },
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
