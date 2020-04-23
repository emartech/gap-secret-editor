import {
  listNamespacedSecrets,
  loadSecret,
  saveSecret,
  patchDeployments,
  getCurrentContext
} from '../../lib/kubernetes-client';
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
    secretLoaded: false,
    secretsByNamespace: {},
    loadInProgress: false,
    saveInProgress: false,
    context: getCurrentContext()
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
      this.loadInProgress = true;
      const secretAsObject = await loadSecret(this.secretNamespace, this.secretName);
      const tuples = Object.entries(secretAsObject);
      this.secret = tuples.map(([key, value]) => ({ key, value }));
      this.loadInProgress = false;
      this.secretLoaded = true;
    },
    async saveSecret() {
      this.saveInProgress = true;
      const tuples = this.secret.map(({ key, value }) => ([key, value]));
      const secretAsObject = Object.fromEntries(tuples);

      await saveSecret(this.secretNamespace, this.secretName, secretAsObject);
      await patchDeployments(this.secretNamespace, this.secretName);
      this.saveInProgress = false;
    },
    sayHello(name) {
      return `Hello ${name}!`;
    }
  },
  async mounted() {
    this.loading = true;
    this.secretsByNamespace = await listNamespacedSecrets();
    this.loading = false;

    setInterval(() => {
      this.context = getCurrentContext();
    }, 1000);
  }
};
