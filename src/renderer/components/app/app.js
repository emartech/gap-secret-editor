import { listNamespacedSecrets } from '../../lib/kubernetes-client';

export default {
  name: 'app',
  template: require('./app.html'),
  data: () => ({
    secretName: '',
    secretNamespace: '',
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
