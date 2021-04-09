export default editor => {
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
};
