import { isEqual, get, last } from 'lodash';
import kubernetesClient from '../../lib/kubernetes-client/kubernetes-client';
import notificationDisplayer from '../../lib/notification-displayer';
import SecretEditor from '../secret-editor/secret-editor';

export const LOCALSTORAGE_KEY_LAST_SELECTED_NAMESPACE = 'lastSelectedNamespace';
export const LOCALSTORAGE_KEY_LAST_SELECTED_NAME = 'lastSelectedName';

export default {
  name: 'app',
  template: require('./app.html'),
  components: { SecretEditor },
  data: () => ({
    secretName: '',
    secretNamespace: '',
    originalSecret: {},
    secret: [],
    loading: {
      contextList: false,
      namespaceList: false,
      nameList: false,
      secretLoad: false,
      secretSave: false
    },
    secretLoaded: false,
    namespaceList: [],
    nameList: [],
    contextList: [],
    context: '',
    searchTerm: '',
    backups: []
  }),
  computed: {
    availableContexts() {
      return this.contextList.map(context => ({
        type: 'option',
        content: last(context.split('_')),
        value: context,
        selected: context === this.context
      }));
    },
    namespaces() {
      return this.namespaceList.map(namespace => ({
        type: 'option',
        content: namespace,
        value: namespace,
        selected: namespace === this.secretNamespace
      }));
    },
    namesForSelectedNamespace() {
      return this.nameList.map(name => ({
        type: 'option',
        content: name,
        value: name,
        selected: name === this.secretName
      }));
    },
    loadEnabled() {
      return this.secretNamespace && this.secretName && !this.loading.secretLoad;
    },
    saveEnabled() {
      return this.secretLoaded && !this.loading.secretSave;
    }
  },
  methods: {
    async selectContext(context) {
      this.clearSecret();
      this.context = context;
      await kubernetesClient.setContext(context);
      await this.initializeNamespacesAndSecrets();
    },
    async selectNamespace(namespace) {
      this.clearSecret();
      this.secretNamespace = namespace;
      this.loading.nameList = true;
      try {
        this.nameList = await kubernetesClient.listSecrets(this.secretNamespace);
        localStorage[LOCALSTORAGE_KEY_LAST_SELECTED_NAMESPACE] = this.secretNamespace;
      } catch (e) {
        if (get(e, 'data.code') === 403) {
          notificationDisplayer.loadFailedDueToUnauthorizedAccess();
        } else {
          notificationDisplayer.loadFailed(e.message);
        }
        this.nameList = [];
      }
      this.loading.nameList = false;
    },
    selectName(name) {
      this.clearSecret();
      this.secretName = name;
      localStorage[LOCALSTORAGE_KEY_LAST_SELECTED_NAME] = this.secretName;
    },
    clearSecret() {
      this.secret = [];
      this.secretLoaded = false;
    },
    async loadBackups() {
      try {
        const secret = await kubernetesClient.loadSecret(this.secretNamespace, `${this.secretName}-backup`);
        this.backups = JSON.parse(secret.BACKUP);
      } catch (e) {
        this.backups = [];
      }
    },
    async loadSecret() {
      this.loading.secretLoad = true;
      try {
        this.originalSecret = await kubernetesClient.loadSecret(this.secretNamespace, this.secretName);
        const tuples = Object.entries(this.originalSecret);
        this.secret = tuples.map(([key, value]) => ({ key, value }));
        this.secretLoaded = true;
        await this.loadBackups();
      } catch (e) {
        notificationDisplayer.loadFailed(e.message);
        this.originalSecret = [];
        this.clearSecret();
      }
      this.loading.secretLoad = false;
    },
    async saveSecret() {
      if (!this.saveEnabled) return;

      this.loading.secretSave = true;
      try {
        const currentlySavedSecret = await kubernetesClient.loadSecret(this.secretNamespace, this.secretName);
        if (isEqual(currentlySavedSecret, this.originalSecret)) {
          const tuples = this.secret.map(({ key, value }) => ([key, value]));
          const secretAsObject = Object.fromEntries(tuples);

          await kubernetesClient.saveSecret(this.secretNamespace, this.secretName, secretAsObject);
          await kubernetesClient.patchDeployments(this.secretNamespace, this.secretName);

          this.originalSecret = secretAsObject;
          notificationDisplayer.saveSuccess();
        } else {
          notificationDisplayer.saveFailedDueToModifiedSecret();
        }
      } catch (e) {
        notificationDisplayer.saveFailed(e.message);
      }
      this.loading.secretSave = false;
    },
    async initialize() {
      this.loading.contextList = true;
      this.contextList = await kubernetesClient.listContexts();
      this.context = await kubernetesClient.getContext();
      this.loading.contextList = false;
      await this.initializeNamespacesAndSecrets();
    },
    async initializeNamespacesAndSecrets() {
      this.loading.namespaceList = true;
      try {
        this.namespaceList = await kubernetesClient.listNamespaces();
        await this.selectLastUsedNamespaceAndName();
      } catch (e) {
        notificationDisplayer.loadFailed(e.message);
        this.namespaceList = [];
      }
      this.loading.namespaceList = false;
    },
    async selectLastUsedNamespaceAndName() {
      const lastSelectedNamespace = localStorage[LOCALSTORAGE_KEY_LAST_SELECTED_NAMESPACE];
      if (lastSelectedNamespace && this.namespaceList.includes(lastSelectedNamespace)) {
        await this.selectNamespace(lastSelectedNamespace);
        const lastSelectedName = localStorage[LOCALSTORAGE_KEY_LAST_SELECTED_NAME];
        if (lastSelectedName && this.nameList.includes(lastSelectedName)) {
          this.selectName(lastSelectedName);
        }
      }
    },
    activateSearch() {
      this.$refs.searchInput.select();
    }
  },
  async mounted() {
    await this.initialize();
  }
};
