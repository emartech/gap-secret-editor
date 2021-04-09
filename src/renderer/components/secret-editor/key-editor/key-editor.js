import AceEditor from 'vue2-ace-editor';
import setCommonAceEditorSettings from '../set-common-ace-editor-settings';

require('brace/theme/github');
require('brace/mode/text');

export default {
  name: 'key-editor',
  template: require('./key-editor.html'),
  components: { AceEditor },
  props: {
    value: { type: String, required: true, default: '' }
  },
  methods: {
    emitChange(newValue) {
      this.$emit('change', newValue);
    },
    initEditor(editor) {
      setCommonAceEditorSettings(editor);
      editor.setOptions({
        maxLines: 1
      });
      editor.commands.bindKeys({
        'Return|Shift-Return|Ctrl-Return|Alt-Return': () => {}
      });

      editor.renderer.setOptions({
        showGutter: false
      });
      editor.renderer.setPadding(12);
    }
  }
};
