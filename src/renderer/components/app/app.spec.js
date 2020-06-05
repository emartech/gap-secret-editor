import { shallowMount } from '@vue/test-utils';
import flushPromises from 'flush-promises';
import kubernetesClient from '../../lib/kubernetes-client/kubernetes-client';
import App, { LOCALSTORAGE_KEY_LAST_SELECTED_NAMESPACE, LOCALSTORAGE_KEY_LAST_SELECTED_NAME } from './app';

describe('App', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('#selectNamespace', () => {
    it('should store selection to local storage when secret list loading succeeds', async () => {
      sinon.stub(kubernetesClient, 'listNamespaces').resolves(['team1', 'team2']);
      sinon.stub(kubernetesClient, 'listSecrets').resolves([]);
      localStorage[LOCALSTORAGE_KEY_LAST_SELECTED_NAMESPACE] = 'some old value';
      const { vm } = await loadApp();

      await vm.selectNamespace('team1');

      expect(localStorage[LOCALSTORAGE_KEY_LAST_SELECTED_NAMESPACE]).to.eql('team1');
    });

    it('should not store selection to local storage when secret list loading fails', async () => {
      sinon.stub(kubernetesClient, 'listNamespaces').resolves(['team1', 'team2']);
      sinon.stub(kubernetesClient, 'listSecrets').rejects(new Error('baj van'));
      localStorage[LOCALSTORAGE_KEY_LAST_SELECTED_NAMESPACE] = 'some old value';
      const { vm } = await loadApp();

      await vm.selectNamespace('team1');

      expect(localStorage[LOCALSTORAGE_KEY_LAST_SELECTED_NAMESPACE]).to.eql('some old value');
    });
  });

  describe('#selectName', () => {
    it('should store selection to local storage', async () => {
      sinon.stub(kubernetesClient, 'listNamespaces').resolves([]);
      localStorage[LOCALSTORAGE_KEY_LAST_SELECTED_NAME] = 'some old value';
      const { vm } = await loadApp();

      await vm.selectName('cool-app');

      expect(localStorage[LOCALSTORAGE_KEY_LAST_SELECTED_NAME]).to.eql('cool-app');
    });
  });

  describe('#initialize', () => {
    it('should load available namespaces', async () => {
      sinon.stub(kubernetesClient, 'listNamespaces').resolves(['namespace1', 'namespace2']);
      const { vm } = await loadApp();

      await vm.initialize();

      expect(vm.namespaceList).to.eql(['namespace1', 'namespace2']);
    });

    it('should select last used namespace and name', async () => {
      localStorage[LOCALSTORAGE_KEY_LAST_SELECTED_NAMESPACE] = 'namespace2';
      localStorage[LOCALSTORAGE_KEY_LAST_SELECTED_NAME] = 'secret1';
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
      sinon.stub(kubernetesClient, 'listNamespaces').resolves([]);
      const { vm } = await loadApp();

      await vm.selectLastUsedNamespaceAndName();

      expect(vm.secretNamespace).to.eql('');
      expect(vm.secretName).to.eql('');
    });

    it('should not select anything when namespace is present in local storage but it is not available', async () => {
      localStorage[LOCALSTORAGE_KEY_LAST_SELECTED_NAMESPACE] = 'namespace666';
      sinon.stub(kubernetesClient, 'listNamespaces').resolves(['namespace1', 'namespace2']);
      const { vm } = await loadApp();

      await vm.selectLastUsedNamespaceAndName();

      expect(vm.secretNamespace).to.eql('');
      expect(vm.secretName).to.eql('');
    });

    describe('when namespace is present in local storage and it is available', () => {
      it('should select only namespace when name is not present in local storage', async () => {
        localStorage[LOCALSTORAGE_KEY_LAST_SELECTED_NAMESPACE] = 'namespace2';
        sinon.stub(kubernetesClient, 'listNamespaces').resolves(['namespace1', 'namespace2']);
        const { vm } = await loadApp();

        await vm.selectLastUsedNamespaceAndName();

        expect(vm.secretNamespace).to.eql('namespace2');
        expect(vm.secretName).to.eql('');
      });

      it('should select only namespace when name is present in local storage but it is not available', async () => {
        localStorage[LOCALSTORAGE_KEY_LAST_SELECTED_NAMESPACE] = 'namespace2';
        localStorage[LOCALSTORAGE_KEY_LAST_SELECTED_NAME] = 'secret666';
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
