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
    displayedSecrets() {
      return this.value.concat({ key: '', value: '' });
    },
    isLastSecret() {
      return (index) => index === this.displayedSecrets.length - 1;
    }
  },
  methods: {
    changeSecretKey(index, key) {
      this._updateSecrets(index, { key });
    },
    changeSecretValue(index, value) {
      this._updateSecrets(index, { value });
    },
    _updateSecrets(index, delta) {
      const updatedSecrets = [...this.displayedSecrets];
      Object.assign(updatedSecrets[index], delta);
      this._emitSecretChange(updatedSecrets);
    },
    deleteSecret(index) {
      const updatedSecrets = [...this.displayedSecrets];
      updatedSecrets.splice(index, 1);
      this._emitSecretChange(updatedSecrets);
    },
    _emitSecretChange(secrets) {
      const nonEmptySecrets = secrets.filter(secret => secret.key || secret.value);
      this.$emit('input', nonEmptySecrets);
    }
  }
};
