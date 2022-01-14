import { ipcRenderer } from 'electron';
import log from 'electron-log';
import { get, isEqual, last, uniqBy } from 'lodash';
import { mapMutations } from 'vuex';
import kubernetesClient from '../../lib/kubernetes-client/kubernetes-client';
import notificationDisplayer from '../../lib/notification-displayer';
import { keyValueArrayToObject, objectToKeyValueArray } from '../../lib/secret-converter';
import SecretEditor from '../secret-editor/secret-editor';
import BackupSelector from '../backup-selector/backup-selector';
import SaveConfirmationDialog from '../save-confirmation-dialog/save-confirmation-dialog';
import AutoUpdateConfirmation from '../auto-update-confirmation/auto-update-confirmation';
import FeedbackDialog from '../feedback-dialog/feedback-dialog';

const logger = log.scope('app');

export const LOCALSTORAGE_KEY_LAST_SELECTED_CONTEXT = 'lastSelectedContext';
export const LOCALSTORAGE_KEY_LAST_SELECTED_NAMESPACE = 'lastSelectedNamespace';
export const LOCALSTORAGE_KEY_LAST_SELECTED_NAME = 'lastSelectedName';
export const LOCALSTORAGE_KEY_UI_COLOR_THEME = 'e.ui.colorTheme';

export default {
  name: 'app',
  template: require('./app.html'),
  components: { SecretEditor, BackupSelector, SaveConfirmationDialog, AutoUpdateConfirmation, FeedbackDialog },
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
      secretSave: false,
      serviceRestart: false
    },
    secretLoaded: false,
    namespaceList: [],
    nameList: [],
    contextList: [],
    context: '',
    searchTerm: '',
    selectedBackupTime: null
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
      const hasDuplicatedKey = this.secret.length !== uniqBy(this.secret, 'key').length;
      return this.secretLoaded && this.hasSecretChanged && !hasDuplicatedKey && !this.loading.secretSave;
    },
    backupEnabled() {
      return this.secretLoaded;
    },
    serviceRestartEnabled() {
      return this.secretLoaded;
    },
    secretAsObject() {
      return keyValueArrayToObject(this.secret);
    },
    hasSecretChanged() {
      return !isEqual(this.originalSecret, this.secretAsObject);
    }
  },
  methods: {
    ...mapMutations(['setBackups', 'setIsDarkModeActive']),
    openFeedbackDialog() {
      this.$refs.feedbackDialog.open();
    },
    async updateIsDarkModeActiveState() {
      await this.$nextTick();
      this.setIsDarkModeActive(localStorage[LOCALSTORAGE_KEY_UI_COLOR_THEME] === 'dark');
    },
    async selectContext(newContext) {
      const currentContext = this.context;
      this.context = newContext;
      if (this.hasSecretChanged && !(await notificationDisplayer.shouldChangesBeDiscarded())) {
        this.context = currentContext;
        return;
      }

      this.clearSecret();
      await kubernetesClient.setContext(this.context);
      await this.initializeNamespacesAndSecrets();
      localStorage[LOCALSTORAGE_KEY_LAST_SELECTED_CONTEXT] = this.context;
    },
    async selectNamespace(newNamespace) {
      const currentNamespace = this.secretNamespace;
      this.secretNamespace = newNamespace;
      if (this.hasSecretChanged && !(await notificationDisplayer.shouldChangesBeDiscarded())) {
        this.secretNamespace = currentNamespace;
        return;
      }

      this.clearSecret();
      this.loading.nameList = true;
      try {
        this.nameList = await kubernetesClient.listSecrets(this.secretNamespace);
        localStorage[LOCALSTORAGE_KEY_LAST_SELECTED_NAMESPACE] = this.secretNamespace;
      } catch (e) {
        if (get(e, 'data.code') === 403) {
          notificationDisplayer.loadFailedDueToUnauthorizedAccess();
        } else {
          notificationDisplayer.loadFailed(e.message);
          logger.error('secret-load-failed', { namespace: this.secretNamespace }, e);
        }
        this.nameList = [];
      }
      this.loading.nameList = false;
    },
    async selectName(newName) {
      const currentName = this.secretName;
      this.secretName = newName;
      if (this.hasSecretChanged && !(await notificationDisplayer.shouldChangesBeDiscarded())) {
        this.secretName = currentName;
        return;
      }

      this.clearSecret();
      localStorage[LOCALSTORAGE_KEY_LAST_SELECTED_NAME] = this.secretName;
      await this.loadSecret();
    },
    async loadSelectedBackup(backup) {
      if (this.hasSecretChanged && !(await notificationDisplayer.shouldChangesBeDiscarded())) return;

      this.secret = objectToKeyValueArray(backup.data);
      this.selectedBackupTime = backup.backupTime;
      notificationDisplayer.backupSuccess();
    },
    clearSecret() {
      this.originalSecret = {};
      this.secret = [];
      this.secretLoaded = false;
    },
    async loadBackups() {
      let backups = [];
      try {
        const secret = await kubernetesClient.loadSecret(this.secretNamespace, `${this.secretName}-backup`);
        const allBackups = JSON.parse(secret.BACKUP);
        backups = allBackups.filter(backup => backup.backupTime && backup.data);
      } catch (e) {
        logger.warn('backup-load-failed', { namespace: this.secretNamespace, name: this.secretName }, e);
      }
      this.setBackups(backups);
      this.selectedBackupTime = backups.length > 0 ? backups[0].backupTime : null;
    },
    async reloadSecret() {
      if (!this.hasSecretChanged || await notificationDisplayer.shouldChangesBeDiscarded()) {
        await this.loadSecret();
      }
    },
    async loadSecret() {
      if (!this.loadEnabled) return;

      this.loading.secretLoad = true;
      try {
        this.originalSecret = await kubernetesClient.loadSecret(this.secretNamespace, this.secretName);
        this.secret = objectToKeyValueArray(this.originalSecret);
        this.secretLoaded = true;
        await this.loadBackups();
      } catch (e) {
        notificationDisplayer.loadFailed(e.message);
        this.clearSecret();
        logger.warn('load-failed', { namespace: this.secretNamespace, name: this.secretName }, e);
      }
      this.loading.secretLoad = false;
    },
    openSaveConfirmationDialog() {
      if (!this.saveEnabled) return;

      this.$refs.saveConfirmationDialog.open();
    },
    async saveSecret() {
      if (!this.saveEnabled) return;

      this.loading.secretSave = true;
      try {
        const currentlySavedSecret = await kubernetesClient.loadSecret(this.secretNamespace, this.secretName);
        if (isEqual(currentlySavedSecret, this.originalSecret)) {
          await kubernetesClient.saveSecret(this.secretNamespace, this.secretName, this.secretAsObject);
          await kubernetesClient.patchDeployments(this.secretNamespace, this.secretName);

          this.originalSecret = this.secretAsObject;
          await this.loadBackups();
          notificationDisplayer.saveSuccess();
        } else {
          notificationDisplayer.saveFailedDueToModifiedSecret();
        }
      } catch (e) {
        notificationDisplayer.saveFailed(e.message);
        logger.warn('save-failed', { namespace: this.secretNamespace, name: this.secretName }, e);
      }
      this.loading.secretSave = false;
    },
    async restartService() {
      this.loading.serviceRestart = true;
      try {
        await kubernetesClient.patchDeployments(this.secretNamespace, this.secretName);
        notificationDisplayer.serviceRestartSuccess();
      } catch (e) {
        notificationDisplayer.serviceRestartFailed(e.message);
        logger.warn('restart-failed', { namespace: this.secretNamespace, name: this.secretName }, e);
      }
      this.loading.serviceRestart = false;
    },
    async initialize() {
      await this.updateIsDarkModeActiveState();

      this.loading.contextList = true;
      this.contextList = await kubernetesClient.listContexts();
      this.loading.contextList = false;

      const lastSelectedContext = localStorage[LOCALSTORAGE_KEY_LAST_SELECTED_CONTEXT];
      const initialContext = this.contextList.includes(lastSelectedContext)
        ? lastSelectedContext
        : await kubernetesClient.getContext();
      await this.selectContext(initialContext);
    },
    async initializeNamespacesAndSecrets() {
      this.loading.namespaceList = true;
      try {
        this.namespaceList = await kubernetesClient.listNamespaces();
        await this.selectLastUsedNamespaceAndName();
      } catch (e) {
        notificationDisplayer.loadFailed(e.message);
        this.namespaceList = [];
        logger.warn('initialization-failed', { namespace: this.secretNamespace, name: this.secretName }, e);
      }
      this.loading.namespaceList = false;
    },
    async selectLastUsedNamespaceAndName() {
      const lastSelectedNamespace = localStorage[LOCALSTORAGE_KEY_LAST_SELECTED_NAMESPACE];
      if (lastSelectedNamespace && this.namespaceList.includes(lastSelectedNamespace)) {
        await this.selectNamespace(lastSelectedNamespace);
        const lastSelectedName = localStorage[LOCALSTORAGE_KEY_LAST_SELECTED_NAME];
        if (lastSelectedName && this.nameList.includes(lastSelectedName)) {
          await this.selectName(lastSelectedName);
        }
      }
    },
    activateSearch() {
      this.$refs.searchInput.select();
    }
  },
  async mounted() {
    await this.initialize();
    ipcRenderer.send('ui-ready');
    logger.info('ui-ready');
  }
};
