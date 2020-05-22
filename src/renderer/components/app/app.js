import { isEqual } from 'lodash';
import {
  listNamespaces,
  listSecrets,
  loadSecret,
  saveSecret,
  patchDeployments,
  getCurrentContext
} from '../../lib/kubernetes-client/kubernetes-client';
import notificationDisplayer from '../../lib/notification-displayer';
import SecretEditor from '../secret-editor/secret-editor';

export default {
  name: 'app',
  template: require('./app.html'),
  components: { SecretEditor },
  data: () => ({
    secretName: '',
    secretNamespace: '',
    originalSecret: {},
    secret: [],
    loading: true,
    secretLoaded: false,
    namespaceList: [],
    secretList: [],
    loadInProgress: false,
    saveInProgress: false,
    context: getCurrentContext()
  }),
  computed: {
    namespaces() {
      return this.namespaceList.map(namespace => ({ type: 'option', content: namespace, value: namespace }));
    },
    secretsForSelectedNamespace() {
      return this.secretList.map(name => ({ type: 'option', content: name, value: name }));
    },
    loadEnabled() {
      return this.secretNamespace && this.secretName && !this.loadInProgress;
    },
    saveEnabled() {
      return this.secretLoaded && !this.saveInProgress;
    }
  },
  methods: {
    async selectNamespace(event) {
      this.secretNamespace = event.target.value;
      this.secretList = await listSecrets(this.secretNamespace);
    },
    selectSecret(event) {
      this.secretName = event.target.value;
    },
    async loadSecret() {
      this.loadInProgress = true;
      this.originalSecret = await loadSecret(this.secretNamespace, this.secretName);
      const tuples = Object.entries(this.originalSecret);
      this.secret = tuples.map(([key, value]) => ({ key, value }));
      this.loadInProgress = false;
      this.secretLoaded = true;
    },
    async saveSecret() {
      if (!this.saveEnabled) return;

      this.saveInProgress = true;
      const currentlySavedSecret = await loadSecret(this.secretNamespace, this.secretName);
      if (isEqual(currentlySavedSecret, this.originalSecret)) {
        const tuples = this.secret.map(({ key, value }) => ([key, value]));
        const secretAsObject = Object.fromEntries(tuples);

        await saveSecret(this.secretNamespace, this.secretName, secretAsObject);
        await patchDeployments(this.secretNamespace, this.secretName);

        notificationDisplayer.saveSuccess();
      } else {
        notificationDisplayer.saveFailedDueToModifiedSecret();
      }
      this.saveInProgress = false;
    },
    updateContext() {
      const currentContext = getCurrentContext();
      if (this.context !== currentContext) {
        this.secretLoaded = false;
        this.context = currentContext;
        this.loadAvailableNamespaces();
      }
    },
    async loadAvailableNamespaces() {
      this.loading = true;
      this.namespaceList = await listNamespaces();
      this.loading = false;
    }
  },
  async mounted() {
    await this.loadAvailableNamespaces();
    setInterval(this.updateContext, 1000);
  }
};
