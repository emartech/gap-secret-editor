import { shallowMount } from '@vue/test-utils';
import flushPromises from 'flush-promises';
import kubernetesClient from '../../lib/kubernetes-client/kubernetes-client';
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

    it('should set backups empty when response is not a valid JSON', async () => {
      sinon.stub(kubernetesClient, 'listContexts').resolves([]);
      sinon.stub(kubernetesClient, 'listNamespaces').resolves([]);
      sinon.stub(kubernetesClient, 'loadSecret').resolves({ BACKUP: '[' });
      const { vm } = await loadApp();

      await vm.loadBackups();

      expect(vm.backups).to.eql([]);
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
});

const loadApp = async () => {
  const wrapper = shallowMount(App);
  await flushPromises();
  return wrapper;
};
