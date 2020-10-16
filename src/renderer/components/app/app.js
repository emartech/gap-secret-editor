import { isEqual, get, last } from 'lodash';
import { format } from 'date-fns';
import kubernetesClient from '../../lib/kubernetes-client/kubernetes-client';
import notificationDisplayer from '../../lib/notification-displayer';
import { objectToKeyValueArray, keyValueArrayToObject } from '../../lib/secret-converter';
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
  filters: {
    formatTime(isoFormat) {
      return format(new Date(isoFormat), 'yyyy-MM-dd HH:mm:SS');
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
    replaceSecret(newSecret) {
      this.secret = objectToKeyValueArray(newSecret);
    },
    clearSecret() {
      this.secret = [];
      this.secretLoaded = false;
    },
    async loadBackups() {
      try {
        const secret = await kubernetesClient.loadSecret(this.secretNamespace, `${this.secretName}-backup`);
        const allBackups = JSON.parse(secret.BACKUP);
        this.backups = allBackups.filter(backup => backup.backupTime && backup.data);
      } catch (e) {
        this.backups = [];
      }
    },
    async loadSecret() {
      this.loading.secretLoad = true;
      try {
        this.originalSecret = await kubernetesClient.loadSecret(this.secretNamespace, this.secretName);
        this.secret = objectToKeyValueArray(this.originalSecret);
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
          const secretAsObject = keyValueArrayToObject(this.secret);
          await kubernetesClient.saveSecret(this.secretNamespace, this.secretName, secretAsObject);
          await kubernetesClient.patchDeployments(this.secretNamespace, this.secretName);

          this.originalSecret = secretAsObject;
          await this.loadBackups();
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
