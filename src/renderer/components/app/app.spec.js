import { shallowMount, mount } from '@vue/test-utils';
import flushPromises from 'flush-promises';
import { ipcRenderer } from 'electron';
import kubernetesClient from '../../lib/kubernetes-client/kubernetes-client';
import notificationDisplayer from '../../lib/notification-displayer';

import App, { LOCALSTORAGE_KEY_LAST_SELECTED_NAMESPACE, LOCALSTORAGE_KEY_LAST_SELECTED_NAME } from './app';

describe('App', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('#availableContexts', () => {
    it('should return available contexts in UI Kit select format and with a short name', async () => {
      sinon.stub(kubernetesClient, 'listContexts').resolves([
        'some-prefix_useless-middle-part_gap-stage',
        'some-prefix_useless-middle-part_gap-prod'
      ]);
      sinon.stub(kubernetesClient, 'listNamespaces').resolves([]);
      const { vm } = await loadApp();
      vm.context = 'some-prefix_useless-middle-part_gap-stage';

      expect(vm.availableContexts).to.eql([
        { type: 'option', content: 'gap-stage', value: 'some-prefix_useless-middle-part_gap-stage', selected: true },
        { type: 'option', content: 'gap-prod', value: 'some-prefix_useless-middle-part_gap-prod', selected: false }
      ]);
    });
  });

  describe('#namespaces', () => {
    it('should return available namespaces in UI Kit select format', async () => {
      sinon.stub(kubernetesClient, 'listContexts').resolves([]);
      sinon.stub(kubernetesClient, 'listNamespaces').resolves(['team1', 'team2']);
      const { vm } = await loadApp();
      vm.secretNamespace = 'team2';

      expect(vm.namespaces).to.eql([
        { type: 'option', content: 'team1', value: 'team1', selected: false },
        { type: 'option', content: 'team2', value: 'team2', selected: true }
      ]);
    });
  });

  describe('#namesForSelectedNamespace', () => {
    it('should return available names in UI Kit select format', async () => {
      sinon.stub(kubernetesClient, 'listContexts').resolves([]);
      sinon.stub(kubernetesClient, 'listNamespaces').resolves([]);
      const { vm } = await loadApp();
      vm.secretName = 'secret2';
      vm.nameList = ['secret1', 'secret2'];

      expect(vm.namesForSelectedNamespace).to.eql([
        { type: 'option', content: 'secret1', value: 'secret1', selected: false },
        { type: 'option', content: 'secret2', value: 'secret2', selected: true }
      ]);
    });
  });

  describe('#availableBackupTimes', () => {
    it('should return backup times of available backups', async () => {
      sinon.stub(kubernetesClient, 'listContexts').resolves([]);
      sinon.stub(kubernetesClient, 'listNamespaces').resolves([]);
      const { vm } = await loadApp();
      vm.backups = [
        { data: { FIELD: 'value' }, backupTime: '2020-09-20T22:17:01.891Z' },
        { data: { FIELD: 'old-value' }, backupTime: '2020-09-19T22:17:01.891Z' }
      ];

      expect(vm.availableBackupTimes).to.eql([
        '2020-09-20T22:17:01.891Z',
        '2020-09-19T22:17:01.891Z'
      ]);
    });
  });

  describe('#saveEnabled', () => {
    it('should return false when secret is not loaded', async () => {
      sinon.stub(kubernetesClient, 'listContexts').resolves([]);
      sinon.stub(kubernetesClient, 'listNamespaces').resolves([]);
      const { vm } = await loadApp();

      expect(vm.saveEnabled).to.be.false;
    });

    it('should return false when secret is loaded but not changed', async () => {
      sinon.stub(kubernetesClient, 'listContexts').resolves([]);
      sinon.stub(kubernetesClient, 'listNamespaces').resolves([]);
      sinon.stub(kubernetesClient, 'loadSecret').resolves({ FIELD1: 'value1', FIELD2: 'value2' });
      const { vm } = await loadApp();
      await vm.loadSecret();

      expect(vm.saveEnabled).to.be.false;
    });

    it('should return true when secret is loaded then changed', async () => {
      sinon.stub(kubernetesClient, 'listContexts').resolves([]);
      sinon.stub(kubernetesClient, 'listNamespaces').resolves([]);
      sinon.stub(kubernetesClient, 'loadSecret').resolves({ FIELD1: 'value1', FIELD2: 'value2' });
      const { vm } = await loadApp();
      await vm.loadSecret();
      vm.secret[0].value = 'changed value';

      expect(vm.saveEnabled).to.be.true;
    });

    it('should return false when secret is being saved', async () => {
      sinon.stub(kubernetesClient, 'listContexts').resolves([]);
      sinon.stub(kubernetesClient, 'listNamespaces').resolves([]);
      sinon.stub(kubernetesClient, 'loadSecret').resolves({ FIELD1: 'value1', FIELD2: 'value2' });
      const { vm } = await loadApp();
      await vm.loadSecret();
      vm.secret[0].value = 'changed value';
      const savePromise = vm.saveSecret();

      expect(vm.saveEnabled).to.be.false;

      await savePromise;
    });
  });

  describe('#selectContext', () => {
    it('should set context field on component', async () => {
      sinon.stub(kubernetesClient, 'listContexts').resolves(['staging', 'production']);
      sinon.stub(kubernetesClient, 'listNamespaces').resolves([]);
      sinon.stub(kubernetesClient, 'listSecrets').resolves([]);
      const { vm } = await loadApp();
      vm.context = 'production';

      await vm.selectContext('staging');

      expect(vm.context).to.eql('staging');
    });

    it('should set kubernetes context', async () => {
      sinon.stub(kubernetesClient, 'listContexts').resolves(['staging', 'production']);
      sinon.stub(kubernetesClient, 'setContext');
      sinon.stub(kubernetesClient, 'listNamespaces').resolves([]);
      sinon.stub(kubernetesClient, 'listSecrets').resolves([]);
      const { vm } = await loadApp();

      await vm.selectContext('staging');

      expect(kubernetesClient.setContext).to.have.been.calledWith('staging');
    });

    it('should reload namespaces', async () => {
      sinon.stub(kubernetesClient, 'listContexts').resolves(['staging', 'production']);
      sinon.stub(kubernetesClient, 'setContext');
      sinon.stub(kubernetesClient, 'listNamespaces').resolves([]);
      sinon.stub(kubernetesClient, 'listSecrets').resolves([]);
      const { vm } = await loadApp();

      await vm.selectContext('staging');

      expect(kubernetesClient.listNamespaces).to.have.been.calledTwice;
    });

    it('should clear loaded secret', async () => {
      sinon.stub(kubernetesClient, 'listContexts').resolves(['staging', 'production']);
      sinon.stub(kubernetesClient, 'setContext');
      sinon.stub(kubernetesClient, 'listNamespaces').resolves([]);
      sinon.stub(kubernetesClient, 'listSecrets').resolves([]);
      const { vm } = await loadApp();
      vm.secret = [{ key: 'doesnt', value: 'matter' }];
      vm.secretLoaded = true;

      await vm.selectContext('staging');

      expect(vm.secret).to.eql([]);
      expect(vm.secretLoaded).to.be.false;
    });
  });

  describe('#selectNamespace', () => {
    it('should store selection to local storage when secret list loading succeeds', async () => {
      sinon.stub(kubernetesClient, 'listContexts').resolves([]);
      sinon.stub(kubernetesClient, 'listNamespaces').resolves(['team1', 'team2']);
      sinon.stub(kubernetesClient, 'listSecrets').resolves([]);
      localStorage[LOCALSTORAGE_KEY_LAST_SELECTED_NAMESPACE] = 'some old value';
      const { vm } = await loadApp();

      await vm.selectNamespace('team1');

      expect(localStorage[LOCALSTORAGE_KEY_LAST_SELECTED_NAMESPACE]).to.eql('team1');
    });

    it('should not store selection to local storage when secret list loading fails', async () => {
      sinon.stub(kubernetesClient, 'listContexts').resolves([]);
      sinon.stub(kubernetesClient, 'listNamespaces').resolves(['team1', 'team2']);
      sinon.stub(kubernetesClient, 'listSecrets').rejects(new Error('baj van'));
      localStorage[LOCALSTORAGE_KEY_LAST_SELECTED_NAMESPACE] = 'some old value';
      const { vm } = await loadApp();

      await vm.selectNamespace('team1');

      expect(localStorage[LOCALSTORAGE_KEY_LAST_SELECTED_NAMESPACE]).to.eql('some old value');
    });

    it('should clear loaded secret', async () => {
      sinon.stub(kubernetesClient, 'listContexts').resolves([]);
      sinon.stub(kubernetesClient, 'listNamespaces').resolves([]);
      sinon.stub(kubernetesClient, 'listSecrets').resolves([]);
      const { vm } = await loadApp();
      vm.secret = [{ key: 'doesnt', value: 'matter' }];
      vm.secretLoaded = true;

      await vm.selectNamespace('team1');

      expect(vm.secret).to.eql([]);
      expect(vm.secretLoaded).to.be.false;
    });
  });

  describe('#selectName', () => {
    it('should store selection to local storage', async () => {
      sinon.stub(kubernetesClient, 'listContexts').resolves([]);
      sinon.stub(kubernetesClient, 'listNamespaces').resolves([]);
      localStorage[LOCALSTORAGE_KEY_LAST_SELECTED_NAME] = 'some old value';
      const { vm } = await loadApp();

      await vm.selectName('cool-app');

      expect(localStorage[LOCALSTORAGE_KEY_LAST_SELECTED_NAME]).to.eql('cool-app');
    });

    it('should clear loaded secret', async () => {
      sinon.stub(kubernetesClient, 'listContexts').resolves([]);
      sinon.stub(kubernetesClient, 'listNamespaces').resolves([]);
      const { vm } = await loadApp();
      vm.secret = [{ key: 'doesnt', value: 'matter' }];
      vm.secretLoaded = true;

      await vm.selectName('cool-app');

      expect(vm.secret).to.eql([]);
      expect(vm.secretLoaded).to.be.false;
    });
  });

  describe('#loadSelectedBackup', () => {
    it('should replace loaded secret with backup', async () => {
      sinon.stub(kubernetesClient, 'listContexts').resolves([]);
      sinon.stub(kubernetesClient, 'listNamespaces').resolves([]);
      const { vm } = await loadApp();
      vm.secret = [{ key: 'FIELD1', value: 'value1' }, { key: 'FIELD2', value: 'value2' }];
      vm.backups = [
        { data: { FIELD1: 'value1', FIELD2: 'value2' }, backupTime: '2020-09-20T22:17:01.891Z' },
        { data: { FIELD1: 'value0', FIELD3: 'value3' }, backupTime: '2020-09-19T22:17:01.891Z' }
      ];

      vm.loadSelectedBackup('2020-09-19T22:17:01.891Z');

      expect(vm.secret).to.eql([{ key: 'FIELD1', value: 'value0' }, { key: 'FIELD3', value: 'value3' }]);
    });

    it('should update selected backup time', async () => {
      sinon.stub(kubernetesClient, 'listContexts').resolves([]);
      sinon.stub(kubernetesClient, 'listNamespaces').resolves([]);
      const { vm } = await loadApp();
      vm.backups = [
        { data: { FIELD1: 'value0', FIELD3: 'value3' }, backupTime: '2020-09-19T22:17:01.891Z' }
      ];

      vm.loadSelectedBackup('2020-09-19T22:17:01.891Z');

      expect(vm.selectedBackupTime).to.eql('2020-09-19T22:17:01.891Z');
    });

    it('should display notification', async () => {
      sinon.stub(kubernetesClient, 'listContexts').resolves([]);
      sinon.stub(kubernetesClient, 'listNamespaces').resolves([]);
      sinon.stub(notificationDisplayer, 'backupSuccess');
      const { vm } = await loadApp();
      vm.backups = [
        { data: { FIELD1: 'value0', FIELD3: 'value2' }, backupTime: '2020-09-20T00:00:00.000Z' },
        { data: { FIELD1: 'value0' }, backupTime: '2020-09-19T00:00:00.000Z' }
      ];
      vm.selectedBackupTime = '2020-09-20T00:00:00.000Z';

      vm.loadSelectedBackup('2020-09-19T00:00:00.000Z');

      expect(notificationDisplayer.backupSuccess).to.have.been.called;
    });
  });

  describe('#loadSecret', () => {
    it('should transform loaded secret', async () => {
      sinon.stub(kubernetesClient, 'listContexts').resolves([]);
      sinon.stub(kubernetesClient, 'listNamespaces').resolves([]);
      sinon.stub(kubernetesClient, 'loadSecret').resolves({ FIELD1: 'value1', FIELD2: 'value2' });
      const { vm } = await loadApp();

      await vm.loadSecret();

      expect(vm.secret).to.eql([{ key: 'FIELD1', value: 'value1' }, { key: 'FIELD2', value: 'value2' }]);
    });

    it('should store original secret without transformation', async () => {
      sinon.stub(kubernetesClient, 'listContexts').resolves([]);
      sinon.stub(kubernetesClient, 'listNamespaces').resolves([]);
      sinon.stub(kubernetesClient, 'loadSecret').resolves({ FIELD1: 'value1', FIELD2: 'value2' });
      const { vm } = await loadApp();

      await vm.loadSecret();

      expect(vm.originalSecret).to.eql({ FIELD1: 'value1', FIELD2: 'value2' });
    });

    it('should indicate loading', async () => {
      sinon.stub(kubernetesClient, 'listContexts').resolves([]);
      sinon.stub(kubernetesClient, 'listNamespaces').resolves([]);
      sinon.stub(kubernetesClient, 'loadSecret').resolves({});
      const { vm } = await loadApp();

      expect(vm.loading.secretLoad).to.eql(false);
      const loadingPromise = vm.loadSecret();
      expect(vm.loading.secretLoad).to.eql(true);
      await loadingPromise;
      expect(vm.loading.secretLoad).to.eql(false);
    });

    it('should load backups also', async () => {
      sinon.stub(kubernetesClient, 'listContexts').resolves([]);
      sinon.stub(kubernetesClient, 'listNamespaces').resolves([]);
      sinon.stub(kubernetesClient, 'loadSecret').resolves({});
      const { vm } = await loadApp();
      vm.secretNamespace = 'space';
      vm.secretName = 'name';

      await vm.loadSecret();

      expect(kubernetesClient.loadSecret).to.have.been.calledTwice;
      expect(kubernetesClient.loadSecret).to.have.been.calledWith('space', 'name');
      expect(kubernetesClient.loadSecret).to.have.been.calledWith('space', 'name-backup');
    });
  });

  describe('#loadBackups', () => {
    it('should load backups for selected secret', async () => {
      sinon.stub(kubernetesClient, 'listContexts').resolves([]);
      sinon.stub(kubernetesClient, 'listNamespaces').resolves([]);
      sinon.stub(kubernetesClient, 'loadSecret').resolves(
        { BACKUP: '[{ "data": { "FIELD": "value" }, "backupTime": "2020-09-20T22:17:01.891Z"}]' }
      );
      const { vm } = await loadApp();
      vm.secretNamespace = 'namespace';
      vm.secretName = 'name';

      await vm.loadBackups();

      expect(kubernetesClient.loadSecret).to.have.been.calledWith('namespace', 'name-backup');
      expect(vm.backups).to.eql([{ data: { FIELD: 'value' }, backupTime: '2020-09-20T22:17:01.891Z' }]);
    });

    it('should set selectedBackupTime based on the first backup', async () => {
      sinon.stub(kubernetesClient, 'listContexts').resolves([]);
      sinon.stub(kubernetesClient, 'listNamespaces').resolves([]);
      sinon.stub(kubernetesClient, 'loadSecret').resolves({
        BACKUP: JSON.stringify([
          { 'data': { 'FIELD': 'value' }, 'backupTime': '2020-09-20T22:17:01.891Z' },
          { 'data': { 'FIELD': 'old-value' }, 'backupTime': '2020-09-19T22:17:01.891Z' }
        ])
      });
      const { vm } = await loadApp();
      vm.secretNamespace = 'namespace';
      vm.secretName = 'name';

      await vm.loadBackups();

      expect(vm.selectedBackupTime).to.eql('2020-09-20T22:17:01.891Z');
    });

    it('should filter out backups with invalid format', async () => {
      sinon.stub(kubernetesClient, 'listContexts').resolves([]);
      sinon.stub(kubernetesClient, 'listNamespaces').resolves([]);
      sinon.stub(kubernetesClient, 'loadSecret').resolves(
        { BACKUP: '[{ "data": { "FIELD": "value" }, "backupTime": "2020-09-20T22:17:01.891Z"}, { "FIELD": "value" }]' }
      );
      const { vm } = await loadApp();
      vm.secretNamespace = 'namespace';
      vm.secretName = 'name';

      await vm.loadBackups();

      expect(kubernetesClient.loadSecret).to.have.been.calledWith('namespace', 'name-backup');
      expect(vm.backups).to.eql([{ data: { FIELD: 'value' }, backupTime: '2020-09-20T22:17:01.891Z' }]);
    });

    it('should set backups empty when response is not a valid JSON', async () => {
      sinon.stub(kubernetesClient, 'listContexts').resolves([]);
      sinon.stub(kubernetesClient, 'listNamespaces').resolves([]);
      sinon.stub(kubernetesClient, 'loadSecret').resolves({ BACKUP: '[' });
      const { vm } = await loadApp();

      await vm.loadBackups();

      expect(vm.backups).to.eql([]);
      expect(vm.selectedBackupTime).to.be.null;
    });

    it('should set backups empty when secret does not exist', async () => {
      sinon.stub(kubernetesClient, 'listContexts').resolves([]);
      sinon.stub(kubernetesClient, 'listNamespaces').resolves([]);
      sinon.stub(kubernetesClient, 'loadSecret').rejects(new Error('secret does not exist'));
      const { vm } = await loadApp();

      await vm.loadBackups();

      expect(vm.backups).to.eql([]);
    });
  });

  describe('#openSaveConfirmationDialog', () => {
    it('should open confirmation dialog when secret is loaded', async () => {
      sinon.stub(kubernetesClient, 'listContexts').resolves([]);
      sinon.stub(kubernetesClient, 'listNamespaces').resolves([]);

      const wrapper = await mount(App);
      await flushPromises();
      wrapper.vm.secretLoaded = true;
      wrapper.vm.secret = [{ key: 'NEW_FIELD', value: 'new value' }];

      await wrapper.vm.openSaveConfirmationDialog();

      expect(wrapper.vm.$refs.saveConfirmationDialog.opened).to.eql(true);
    });

    it('should keep confirmation dialog closed when secret is not loaded', async () => {
      sinon.stub(kubernetesClient, 'listContexts').resolves([]);
      sinon.stub(kubernetesClient, 'listNamespaces').resolves([]);

      const wrapper = await mount(App);
      await flushPromises();
      wrapper.vm.secretLoaded = false;

      await wrapper.vm.openSaveConfirmationDialog();

      expect(wrapper.vm.$refs.saveConfirmationDialog.opened).to.eql(false);
    });
  });

  describe('#saveSecret', () => {
    it('should store successfully saved secret as original secret', async () => {
      sinon.stub(kubernetesClient, 'listContexts').resolves([]);
      sinon.stub(kubernetesClient, 'listNamespaces').resolves([]);
      sinon.stub(kubernetesClient, 'loadSecret').resolves({ FIELD: 'value' });
      sinon.stub(kubernetesClient, 'saveSecret').resolves();
      sinon.stub(kubernetesClient, 'patchDeployments').resolves();
      const { vm } = await loadApp();
      vm.secretLoaded = true;
      vm.originalSecret = { FIELD: 'value' };
      vm.secret = [{ key: 'FIELD', value: 'new-value' }];

      await vm.saveSecret();

      expect(vm.originalSecret).to.eql({ FIELD: 'new-value' });
    });

    it('should reload backups', async () => {
      sinon.stub(kubernetesClient, 'listContexts').resolves([]);
      sinon.stub(kubernetesClient, 'listNamespaces').resolves([]);
      sinon.stub(kubernetesClient, 'loadSecret').resolves({ FIELD: 'value' });
      sinon.stub(kubernetesClient, 'saveSecret').resolves();
      sinon.stub(kubernetesClient, 'patchDeployments').resolves();
      const { vm } = await loadApp();
      vm.secretNamespace = 'team';
      vm.secretName = 'app';
      vm.secretLoaded = true;
      vm.originalSecret = { FIELD: 'value' };

      await vm.saveSecret();

      expect(kubernetesClient.loadSecret).to.have.been.calledWith('team', 'app');
      expect(kubernetesClient.loadSecret).to.have.been.calledWith('team', 'app-backup');
    });

    it('should not modify original secret when save fails', async () => {
      sinon.stub(kubernetesClient, 'listContexts').resolves([]);
      sinon.stub(kubernetesClient, 'listNamespaces').resolves([]);
      sinon.stub(kubernetesClient, 'loadSecret').resolves({ FIELD: 'value' });
      sinon.stub(kubernetesClient, 'saveSecret').rejects(new Error('oh no!'));
      const { vm } = await loadApp();
      vm.secretLoaded = true;
      vm.originalSecret = { FIELD: 'value' };
      vm.secret = [{ key: 'FIELD', value: 'new-value' }];

      await vm.saveSecret();

      expect(vm.originalSecret).to.eql({ FIELD: 'value' });
    });
  });

  describe('#initialize', () => {
    it('should load context data', async () => {
      sinon.stub(kubernetesClient, 'listContexts').resolves(['staging', 'production', 'test']);
      sinon.stub(kubernetesClient, 'getContext').resolves('staging');
      const { vm } = await loadApp();

      await vm.initialize();

      expect(vm.contextList).to.eql(['staging', 'production', 'test']);
      expect(vm.context).to.eql('staging');
    });

    it('should load available namespaces', async () => {
      sinon.stub(kubernetesClient, 'listContexts').resolves([]);
      sinon.stub(kubernetesClient, 'listNamespaces').resolves(['namespace1', 'namespace2']);
      const { vm } = await loadApp();

      await vm.initialize();

      expect(vm.namespaceList).to.eql(['namespace1', 'namespace2']);
    });

    it('should select last used namespace and name', async () => {
      localStorage[LOCALSTORAGE_KEY_LAST_SELECTED_NAMESPACE] = 'namespace2';
      localStorage[LOCALSTORAGE_KEY_LAST_SELECTED_NAME] = 'secret1';
      sinon.stub(kubernetesClient, 'listContexts').resolves([]);
      sinon.stub(kubernetesClient, 'listNamespaces').resolves(['namespace1', 'namespace2']);
      sinon.stub(kubernetesClient, 'listSecrets').resolves(['secret1', 'secret2']);
      const { vm } = await loadApp();

      await vm.initialize();

      expect(vm.secretNamespace).to.eql('namespace2');
      expect(vm.secretName).to.eql('secret1');
    });
  });

  describe('#selectLastUsedNamespaceAndName', () => {
    it('should not select anything when local storage is empty', async () => {
      sinon.stub(kubernetesClient, 'listContexts').resolves([]);
      sinon.stub(kubernetesClient, 'listNamespaces').resolves([]);
      const { vm } = await loadApp();

      await vm.selectLastUsedNamespaceAndName();

      expect(vm.secretNamespace).to.eql('');
      expect(vm.secretName).to.eql('');
    });

    it('should not select anything when namespace is present in local storage but it is not available', async () => {
      localStorage[LOCALSTORAGE_KEY_LAST_SELECTED_NAMESPACE] = 'namespace666';
      sinon.stub(kubernetesClient, 'listContexts').resolves([]);
      sinon.stub(kubernetesClient, 'listNamespaces').resolves(['namespace1', 'namespace2']);
      const { vm } = await loadApp();

      await vm.selectLastUsedNamespaceAndName();

      expect(vm.secretNamespace).to.eql('');
      expect(vm.secretName).to.eql('');
    });

    describe('when namespace is present in local storage and it is available', () => {
      it('should select only namespace when name is not present in local storage', async () => {
        localStorage[LOCALSTORAGE_KEY_LAST_SELECTED_NAMESPACE] = 'namespace2';
        sinon.stub(kubernetesClient, 'listContexts').resolves([]);
        sinon.stub(kubernetesClient, 'listNamespaces').resolves(['namespace1', 'namespace2']);
        const { vm } = await loadApp();

        await vm.selectLastUsedNamespaceAndName();

        expect(vm.secretNamespace).to.eql('namespace2');
        expect(vm.secretName).to.eql('');
      });

      it('should select only namespace when name is present in local storage but it is not available', async () => {
        localStorage[LOCALSTORAGE_KEY_LAST_SELECTED_NAMESPACE] = 'namespace2';
        localStorage[LOCALSTORAGE_KEY_LAST_SELECTED_NAME] = 'secret666';
        sinon.stub(kubernetesClient, 'listContexts').resolves([]);
        sinon.stub(kubernetesClient, 'listNamespaces').resolves(['namespace1', 'namespace2']);
        sinon.stub(kubernetesClient, 'listSecrets').resolves(['secret1', 'secret2']);
        const { vm } = await loadApp();

        await vm.selectLastUsedNamespaceAndName();

        expect(vm.secretNamespace).to.eql('namespace2');
        expect(vm.secretName).to.eql('');
      });

      it('should select namespace and name when name is present in local storage and it is available', async () => {
        localStorage[LOCALSTORAGE_KEY_LAST_SELECTED_NAMESPACE] = 'namespace2';
        localStorage[LOCALSTORAGE_KEY_LAST_SELECTED_NAME] = 'secret1';
        sinon.stub(kubernetesClient, 'listContexts').resolves([]);
        sinon.stub(kubernetesClient, 'listNamespaces').resolves(['namespace1', 'namespace2']);
        sinon.stub(kubernetesClient, 'listSecrets').resolves(['secret1', 'secret2']);
        const { vm } = await loadApp();

        await vm.selectLastUsedNamespaceAndName();

        expect(vm.secretNamespace).to.eql('namespace2');
        expect(vm.secretName).to.eql('secret1');
      });
    });
  });

  describe('when update is available', () => {
    it('should show loading indicator when update request is confirmed', async () => {
      sinon.stub(kubernetesClient, 'listContexts').resolves([]);
      sinon.stub(kubernetesClient, 'listNamespaces').resolves([]);
      sinon.stub(window.e.utils, 'openConsequentialConfirmationDialog').callsFake(config => {
        config.confirm.callback();
      });

      const fakeEvent = { sender: { send: () => {} } };
      const { vm } = await loadApp();

      ipcRenderer.emit('confirm-update', fakeEvent, { update: 'info' });
      await vm.$nextTick();
      await vm.$nextTick();

      expect(vm.updateInProgress).to.eql(true);
    });
  });
});

const loadApp = async () => {
  const wrapper = shallowMount(App);
  await flushPromises();
  return wrapper;
};
