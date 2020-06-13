import SecretEditorTextarea from './secret-editor-textarea/secret-editor-textarea';

export default {
  name: 'secret-editor',
  template: require('./secret-editor.html'),
  components: {
    SecretEditorTextarea
  },
  props: {
    value: { type: Array, required: true, default: () => [] }
  },
  computed: {
    fields() {
      return this.value.concat({ key: '', value: '' });
    },
    isLastField() {
      return (index) => index === this.fields.length - 1;
    }
  },
  methods: {
    changeFieldKey(index, key) {
      this._updateFields(index, { key });
    },
    changeFieldValue(index, value) {
      this._updateFields(index, { value });
    },
    _updateFields(index, delta) {
      const updatedFields = [...this.fields];
      Object.assign(updatedFields[index], delta);
      this._emitSecretChange(updatedFields);
    },
    deleteField(index) {
      const updatedFields = [...this.fields];
      updatedFields.splice(index, 1);
      this._emitSecretChange(updatedFields);
    },
    _emitSecretChange(fields) {
      const nonEmptyFields = fields.filter(secret => secret.key || secret.value);
      this.$emit('input', nonEmptyFields);
    }
  }
};
