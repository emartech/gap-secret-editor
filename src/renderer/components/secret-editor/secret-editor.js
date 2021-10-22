import KeyEditor from './key-editor/key-editor';
import ValueEditor from './value-editor/value-editor';

export default {
  name: 'secret-editor',
  template: require('./secret-editor.html'),
  components: { KeyEditor, ValueEditor },
  props: {
    value: { type: Array, required: true, default: () => [] },
    searchTerm: { type: String, required: false, default: () => '' }
  },
  data: () => ({
    keysOfHiddenFields: []
  }),
  computed: {
    fields() {
      return this.value
        .concat({ key: '', value: '' })
        .map((item, index) => ({ ...item, index }));
    },
    filteredFields() {
      return this.fields.filter(field => !this.keysOfHiddenFields.includes(field.key));
    },
    isLastField() {
      return (index) => index === this.fields.length - 1;
    }
  },
  watch: {
    searchTerm() {
      this._updateHiddenFields();
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
    },
    _updateHiddenFields() {
      this.keysOfHiddenFields = this.fields
        .filter(field => {
          if (!this.searchTerm || (field.key === '' && field.value === '')) return false;
          return !stringMatches(field.key, this.searchTerm) && !stringMatches(field.value, this.searchTerm);
        })
        .map(field => field.key);
    }
  },
  mounted() {
    this._updateHiddenFields();
  }
};

const stringMatches = (string, searchTerm) => string.toLowerCase().includes(searchTerm.toLowerCase());
