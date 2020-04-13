import { listNamespacedSecrets, loadSecret, saveSecret } from '../../lib/kubernetes-client';
import SecretEditor from '../secret-editor/secret-editor';

export default {
  name: 'app',
  template: require('./app.html'),
  components: { SecretEditor },
  data: () => ({
    secretName: '',
    secretNamespace: '',
    secret: [],
    loading: true,
    secretsByNamespace: {}
  }),
  computed: {
    namespaces() {
      return Object.keys(this.secretsByNamespace)
        .map(namespace => ({ type: 'option', content: namespace, value: namespace }));
    },
    secretsForSelectedNamespace() {
      return (this.secretsByNamespace[this.secretNamespace] || [])
        .map(name => ({ type: 'option', content: name, value: name }));
    }
  },
  methods: {
    selectNamespace(event) {
      this.secretNamespace = event.target.value;
    },
    selectSecret(event) {
      this.secretName = event.target.value;
    },
    async loadSecret() {
      const secretAsObject = await loadSecret(this.secretNamespace, this.secretName);
      const tuples = Object.entries(secretAsObject);
      this.secret = tuples.map(([key, value]) => ({ key, value }));
    },
    async saveSecret() {
      const tuples = this.secret.map(({ key, value }) => ([key, value]));
      const secretAsObject = Object.fromEntries(tuples);

      await saveSecret(this.secretNamespace, this.secretName, secretAsObject);
    },
    sayHello(name) {
      return `Hello ${name}!`;
    }
  },
  async mounted() {
    this.loading = true;
    this.secretsByNamespace = await listNamespacedSecrets();
    this.loading = false;
  }
};
