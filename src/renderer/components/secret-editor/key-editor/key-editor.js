import AceEditor from 'vue2-ace-editor';
import EditorBase from '../editor-base';

require('brace/theme/github');
require('brace/mode/text');

export default {
  name: 'key-editor',
  template: require('./key-editor.html'),
  mixins: [EditorBase],
  components: { AceEditor },
  methods: {
    initEditor(editor) {
      this.setCommonAceEditorSettings(editor);
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
