import ValueEditor from './value-editor/value-editor';

export default {
  name: 'secret-editor',
  template: require('./secret-editor.html'),
  components: {
    ValueEditor
  },
  props: {
    value: { type: Array, required: true, default: () => [] },
    searchTerm: { type: String, required: false, default: () => '' }
  },
  computed: {
    fields() {
      return this.value
        .concat({ key: '', value: '' })
        .map((item, index) => ({ ...item, index }));
    },
    filteredFields() {
      return this.fields.filter(field => this.searchTerm
        ? stringMatches(field.key, this.searchTerm) || stringMatches(field.value, this.searchTerm)
        : true
      );
    },
    isLastField() {
      return (index) => index === this.fields.length - 1;
    }
  },
  methods: {
    isDuplicatedField(key) {
      return this.value.filter(field => field.key === key).length > 1;
    },
    changeFieldKey(index, key) {
      this._updateFields(index, { key });
    },
    changeFieldValue(index, value) {
      this._updateFields(index, { value });
    },
    _updateFields(index, delta) {
      const updatedFields = this.fields.map(field => field.index === index ? { ...field, ...delta } : field);
      this._emitSecretChange(updatedFields);
    },
    deleteField(index) {
      const updatedFields = this.fields.filter(field => field.index !== index);
      this._emitSecretChange(updatedFields);
    },
    _emitSecretChange(fields) {
      const nonEmptyFields = fields.filter(secret => secret.key || secret.value);
      this.$emit('input', nonEmptyFields.map(field => ({ key: field.key, value: field.value })));
    }
  }
};

const stringMatches = (string, searchTerm) => string.toLowerCase().includes(searchTerm.toLowerCase());
