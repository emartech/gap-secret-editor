import AceEditor from 'vue2-ace-editor';
import JsonBadge from '../json-badge/json-badge';
import { looksLikeJson } from '../../../lib/json-helper/json-helper';
import setCommonAceEditorSettings from '../set-common-ace-editor-settings';

require('brace/theme/github');
require('brace/mode/text');
require('brace/mode/json');

export default {
  name: 'value-editor',
  template: require('./value-editor.html'),
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
      setCommonAceEditorSettings(editor);
      editor.setOptions({
        maxLines: 30
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
