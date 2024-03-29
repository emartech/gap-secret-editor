import flushPromises from 'flush-promises';
import { KubeConfig } from '@kubernetes/client-node';
import App, { LOCALSTORAGE_KEY_LAST_SELECTED_NAMESPACE } from '../src/renderer/components/app/app';
import { mountWithFakeAceEditor } from '../test-helpers/mount-helpers';

describe('App - Integration', () => {
  const fakeKubernetesApiClient = {};
  const contextList = ['staging', 'production'];
  const namespaceList = ['cool-team', 'lame-team'];
  const secretList = ['best-app', 'wonderful-app'];

  beforeEach(() => {
    KubeConfig.prototype.makeApiClient.returns(fakeKubernetesApiClient);
    localStorage.clear();
  });

  describe('when loaded', () => {
    it('should list available namespaces', async () => {
      stubContextList(contextList);
      stubNamespaceList(namespaceList);
      const wrapper = await loadApp();

      const items = wrapper.find('#namespace-selector').attributes('items');
      expect(JSON.parse(items)).to.eql([
        { type: 'option', content: 'cool-team', value: 'cool-team', selected: false },
        { type: 'option', content: 'lame-team', value: 'lame-team', selected: false }
      ]);
    });

    it('should automatically select last used namespace', async () => {
      localStorage[LOCALSTORAGE_KEY_LAST_SELECTED_NAMESPACE] = 'cool-team';
      stubContextList(contextList);
      stubNamespaceList(namespaceList);
      const wrapper = await loadApp();

      const items = wrapper.find('#namespace-selector').attributes('items');
      expect(JSON.parse(items)).to.eql([
        { type: 'option', content: 'cool-team', value: 'cool-team', selected: true },
        { type: 'option', content: 'lame-team', value: 'lame-team', selected: false }
      ]);
    });

    it('should disable reload/save buttons', async () => {
      stubContextList(contextList);
      stubNamespaceList(namespaceList);
      const wrapper = await loadApp();

      expect(wrapper.find('#reload-button').attributes('disabled')).to.eql('disabled');
      expect(wrapper.find('#save-button').attributes('disabled')).to.eql('disabled');
    });

    it('should display error notification when namespace list loading fails', async () => {
      sinon.stub(window.e.utils, 'openNotification');
      stubContextList(contextList);
      stubFailingNamespaceList();
      const wrapper = await loadApp();

      const items = wrapper.find('#namespace-selector').attributes('items');
      expect(JSON.parse(items)).to.eql([]);
      const expectedNotificationParams = sinon.match({ title: 'Load failed', content: 'Oh no!' });
      expect(window.e.utils.openNotification).to.have.been.calledWith(expectedNotificationParams);
    });
  });

  describe('when namespace selected', () => {
    it('should list available secrets', async () => {
      stubContextList(contextList);
      stubNamespaceList(namespaceList);
      stubSecretList(secretList);
      const wrapper = await loadApp();

      await changeSelectValue(wrapper, '#namespace-selector', 'cool-team');

      const items = wrapper.find('#secret-selector').attributes('items');
      expect(JSON.parse(items)).to.eql([
        { type: 'option', content: 'best-app', value: 'best-app', selected: false },
        { type: 'option', content: 'wonderful-app', value: 'wonderful-app', selected: false }
      ]);
    });

    it('should disable reload/save buttons', async () => {
      stubContextList(contextList);
      stubNamespaceList(namespaceList);
      stubSecretList(secretList);
      const wrapper = await loadApp();

      await changeSelectValue(wrapper, '#namespace-selector', 'cool-team');

      expect(wrapper.find('#reload-button').attributes('disabled')).to.eql('disabled');
      expect(wrapper.find('#save-button').attributes('disabled')).to.eql('disabled');
    });

    it('should display error notification when secret list loading fails', async () => {
      sinon.stub(window.e.utils, 'openNotification');
      stubContextList(contextList);
      stubNamespaceList(namespaceList);
      stubFailingSecretList();
      const wrapper = await loadApp();

      await changeSelectValue(wrapper, '#namespace-selector', 'cool-team');

      const items = wrapper.find('#secret-selector').attributes('items');
      expect(JSON.parse(items)).to.eql([]);
      const expectedNotificationParams = sinon.match({ title: 'Load failed', content: 'Oh no!' });
      expect(window.e.utils.openNotification).to.have.been.calledWith(expectedNotificationParams);
    });

    it('should display error notification when secret list loading fails do to not having access', async () => {
      sinon.stub(window.e.utils, 'openNotification');
      stubContextList(contextList);
      stubNamespaceList(namespaceList);
      stubUnauthorizedSecretList();
      const wrapper = await loadApp();

      await changeSelectValue(wrapper, '#namespace-selector', 'cool-team');

      const items = wrapper.find('#secret-selector').attributes('items');
      expect(JSON.parse(items)).to.eql([]);
      const expectedNotificationParams = sinon.match({ title: 'Load failed', content: sinon.match('permission') });
      expect(window.e.utils.openNotification).to.have.been.calledWith(expectedNotificationParams);
    });
  });

  describe('when namespace and secret selected', () => {
    it('should enable reload button', async () => {
      stubContextList(contextList);
      stubNamespaceList(namespaceList);
      stubSecretList(secretList);
      const wrapper = await loadApp();

      await changeSelectValue(wrapper, '#namespace-selector', 'cool-team');
      await changeSelectValue(wrapper, '#secret-selector', 'best-app');

      expect(wrapper.find('#reload-button').attributes('disabled')).to.be.undefined;
    });

    it('should disable save button when secret not loaded', async () => {
      stubContextList(contextList);
      stubNamespaceList(namespaceList);
      stubSecretList(secretList);
      const wrapper = await loadApp();

      await changeSelectValue(wrapper, '#namespace-selector', 'cool-team');
      await changeSelectValue(wrapper, '#secret-selector', 'best-app');

      expect(wrapper.find('#save-button').attributes('disabled')).to.eql('disabled');
    });

    it('should load secret when secret selected', async () => {
      stubContextList(contextList);
      stubNamespaceList(namespaceList);
      stubSecretList(secretList);
      stubSelectedSecret({
        NUMBER_42: 'NDI=',
        SUPER_SECRET_JSON: 'eyJzdXBlciI6ICJzZWNyZXQifQ=='
      });
      const wrapper = await loadApp();

      await changeSelectValue(wrapper, '#namespace-selector', 'cool-team');
      await changeSelectValue(wrapper, '#secret-selector', 'best-app');

      const renderedSecretKeys = wrapper.findAll('#secret-editor .secret-key').wrappers
        .map(wrapper => wrapper.element.value);
      expect(renderedSecretKeys).to.eql(['NUMBER_42', 'SUPER_SECRET_JSON', '']);
    });

    it('should load secret and filter its fields when secret selected and filter provided', async () => {
      stubContextList(contextList);
      stubNamespaceList(namespaceList);
      stubSecretList(secretList);
      stubSelectedSecret({
        NUMBER_42: 'NDI=',
        SUPER_SECRET_JSON: 'eyJzdXBlciI6ICJzZWNyZXQifQ=='
      });
      const wrapper = await loadApp();

      await changeSelectValue(wrapper, '#namespace-selector', 'cool-team');
      await changeSelectValue(wrapper, '#secret-selector', 'best-app');
      await changeInputValue(wrapper, '#search-input', 'super');

      const renderedSecretKeys = wrapper.findAll('#secret-editor .secret-key').wrappers
        .map(wrapper => wrapper.element.value);
      expect(renderedSecretKeys).to.eql(['SUPER_SECRET_JSON', '']);
    });

    it('should display error notification when secret loading fails', async () => {
      sinon.stub(window.e.utils, 'openNotification');
      stubContextList(contextList);
      stubNamespaceList(namespaceList);
      stubSecretList(secretList);
      stubFailingSelectedSecret();
      const wrapper = await loadApp();

      await changeSelectValue(wrapper, '#namespace-selector', 'cool-team');
      await changeSelectValue(wrapper, '#secret-selector', 'best-app');

      const expectedNotificationParams = sinon.match({ title: 'Load failed', content: 'Oh no!' });
      expect(window.e.utils.openNotification).to.have.been.calledWith(expectedNotificationParams);
    });

    it('should not display empty secret when secret loading fails', async () => {
      stubContextList(contextList);
      stubNamespaceList(namespaceList);
      stubSecretList(secretList);
      stubFailingSelectedSecret();
      const wrapper = await loadApp();

      await changeSelectValue(wrapper, '#namespace-selector', 'cool-team');
      await changeSelectValue(wrapper, '#secret-selector', 'best-app');

      const renderedSecretKeys = wrapper.findAll('#secret-editor .secret-key');
      expect(renderedSecretKeys).to.have.lengthOf(0);
    });

    describe('when loaded secret has not changed since load', () => {
      it('should not save secret when save button clicked then canceled', async () => {
        stubContextList(contextList);
        stubNamespaceList(namespaceList);
        stubSecretList(secretList);
        stubChangedSelectedSecret({ FOOD: 'cGl6emE=' }, { FOOD: 'cGl6emE=' });
        const saveMethodMock = stubApiClient('replaceNamespacedSecret');
        stubDeploymentListForSelectedSecret();
        const patchMethodMock = stubPatchMethod();
        const wrapper = await loadApp();

        await changeSelectValue(wrapper, '#namespace-selector', 'cool-team');
        await changeSelectValue(wrapper, '#secret-selector', 'best-app');
        await changeInputValue(wrapper, '#secret-editor .secret-key', 'DRINK');
        await changeInputValue(wrapper, '#secret-editor .secret-value', 'coke');
        await clickButton(wrapper, '#save-button');
        await clickButton(wrapper, '#save-cancel-button');

        expect(saveMethodMock).to.not.have.been.called;
        expect(patchMethodMock).to.not.have.been.called;
      });

      it('should save secret when save button clicked then confirmed', async () => {
        stubContextList(contextList);
        stubNamespaceList(namespaceList);
        stubSecretList(secretList);
        stubChangedSelectedSecret({ FOOD: 'cGl6emE=' }, { FOOD: 'cGl6emE=' });
        const saveMethodMock = stubApiClient('replaceNamespacedSecret');
        stubDeploymentListForSelectedSecret();
        const patchMethodMock = stubPatchMethod();
        const wrapper = await loadApp();

        await changeSelectValue(wrapper, '#namespace-selector', 'cool-team');
        await changeSelectValue(wrapper, '#secret-selector', 'best-app');
        await changeInputValue(wrapper, '#secret-editor .secret-key', 'DRINK');
        await changeInputValue(wrapper, '#secret-editor .secret-value', 'coke');
        await clickButton(wrapper, '#save-button');
        await clickButton(wrapper, '#save-confirm-button');

        expect(saveMethodMock).to.have.been.calledWith(
          'best-app',
          'cool-team',
          { stringData: { DRINK: 'coke' }, metadata: { name: 'best-app' } }
        );
        expect(patchMethodMock).to.have.been.called;
      });

      it('should display success notification when save button clicked', async () => {
        stubContextList(contextList);
        stubNamespaceList(namespaceList);
        stubSecretList(secretList);
        stubChangedSelectedSecret({ FOOD: 'cGl6emE=' }, { FOOD: 'cGl6emE=' });
        sinon.stub(window.e.utils, 'openNotification');
        const wrapper = await loadApp();

        await changeSelectValue(wrapper, '#namespace-selector', 'cool-team');
        await changeSelectValue(wrapper, '#secret-selector', 'best-app');
        await changeInputValue(wrapper, '#secret-editor .secret-key', 'DRINK');
        await changeInputValue(wrapper, '#secret-editor .secret-value', 'coke');
        await clickButton(wrapper, '#save-button');
        await clickButton(wrapper, '#save-confirm-button');

        expect(window.e.utils.openNotification).to.have.been.calledWith(sinon.match({ title: 'Secret saved' }));
      });

      it('should display error notification when save fails', async () => {
        stubContextList(contextList);
        stubNamespaceList(namespaceList);
        stubSecretList(secretList);
        stubChangedSelectedSecret({ FOOD: 'cGl6emE=' }, { FOOD: 'cGl6emE=' });
        stubFailingDeploymentListForSelectedSecret();
        sinon.stub(window.e.utils, 'openNotification');
        const wrapper = await loadApp();

        await changeSelectValue(wrapper, '#namespace-selector', 'cool-team');
        await changeSelectValue(wrapper, '#secret-selector', 'best-app');
        await changeInputValue(wrapper, '#secret-editor .secret-key', 'DRINK');
        await changeInputValue(wrapper, '#secret-editor .secret-value', 'coke');
        await clickButton(wrapper, '#save-button');
        await clickButton(wrapper, '#save-confirm-button');

        const expectedNotificationParams = sinon.match({ title: 'Save failed', content: 'Oh no!' });
        expect(window.e.utils.openNotification).to.have.been.calledWith(expectedNotificationParams);
      });
    });

    describe('when loaded secret has changed since load', () => {
      it('should not save secret when save button clicked', async () => {
        stubContextList(contextList);
        stubNamespaceList(namespaceList);
        stubSecretList(secretList);
        stubChangedSelectedSecret({ FOOD: 'cGl6emE=' }, { FOOD: 'bcOha29zIG5va2VkbGk=' });
        const saveMethodMock = stubApiClient('replaceNamespacedSecret');
        stubDeploymentListForSelectedSecret();
        const patchMethodMock = stubPatchMethod();
        const wrapper = await loadApp();

        await changeSelectValue(wrapper, '#namespace-selector', 'cool-team');
        await changeSelectValue(wrapper, '#secret-selector', 'best-app');
        await changeInputValue(wrapper, '#secret-editor .secret-key', 'DRINK');
        await changeInputValue(wrapper, '#secret-editor .secret-value', 'coke');
        await clickButton(wrapper, '#save-button');
        await clickButton(wrapper, '#save-confirm-button');

        expect(saveMethodMock).to.not.have.been.called;
        expect(patchMethodMock).to.not.have.been.called;
      });

      it('should display error notification when save button clicked', async () => {
        stubContextList(contextList);
        stubNamespaceList(namespaceList);
        stubSecretList(secretList);
        stubChangedSelectedSecret({ FOOD: 'cGl6emE=' }, { FOOD: 'bcOha29zIG5va2VkbGk=' });
        sinon.stub(window.e.utils, 'openNotification');
        const wrapper = await loadApp();

        await changeSelectValue(wrapper, '#namespace-selector', 'cool-team');
        await changeSelectValue(wrapper, '#secret-selector', 'best-app');
        await changeInputValue(wrapper, '#secret-editor .secret-key', 'DRINK');
        await changeInputValue(wrapper, '#secret-editor .secret-value', 'coke');
        await clickButton(wrapper, '#save-button');
        await clickButton(wrapper, '#save-confirm-button');

        const expectedNotificationParams = sinon.match({
          title: 'Save failed',
          content: sinon.match('Secret has been modified')
        });
        expect(window.e.utils.openNotification).to.have.been.calledWith(expectedNotificationParams);
      });
    });
  });

  const stubContextList = contexts => {
    KubeConfig.prototype.getContexts.returns(contexts.map(context => ({ name: context })));
  };

  const stubNamespaceList = namespaces => {
    stubApiClient('listNamespace', {
      items: namespaces.map(name => ({ metadata: { name }, status: { phase: 'Active' } }))
    });
  };

  const stubFailingNamespaceList = () => {
    stubFailingApiClient('listNamespace');
  };

  const stubSecretList = secrets => {
    stubApiClient('listNamespacedSecret', { items: secrets.map(name => ({ metadata: { name } })) });
  };

  const stubFailingSecretList = () => {
    stubFailingApiClient('listNamespacedSecret');
  };

  const stubUnauthorizedSecretList = () => {
    stubFailingApiClient('listNamespacedSecret', { code: 403 });
  };

  const stubSelectedSecret = secret => {
    stubApiClient('readNamespacedSecret', { data: secret });
  };

  const stubFailingSelectedSecret = () => {
    stubFailingApiClient('readNamespacedSecret');
  };

  const stubChangedSelectedSecret = (firstSecret, secondSecret) => {
    const clientMethodStub = sinon.stub();
    clientMethodStub.onFirstCall().resolves({ body: { data: firstSecret } });
    clientMethodStub.onSecondCall().resolves({ body: { data: { BACKUP: 'W10=' } } });
    clientMethodStub.onThirdCall().resolves({ body: { data: secondSecret } });
    fakeKubernetesApiClient.readNamespacedSecret = clientMethodStub;
  };

  const stubDeploymentListForSelectedSecret = () => {
    stubApiClient('listNamespacedDeployment', { items: [{ metadata: { name: 'best-app-web' } }] });
  };

  const stubFailingDeploymentListForSelectedSecret = () => {
    stubFailingApiClient('listNamespacedDeployment');
  };

  const stubPatchMethod = () => {
    return stubApiClient('patchNamespacedDeployment');
  };

  const stubApiClient = (method, responseBody = null) => {
    const clientMethodStub = sinon.stub().resolves({ body: responseBody });
    fakeKubernetesApiClient[method] = clientMethodStub;
    return clientMethodStub;
  };

  const stubFailingApiClient = (method, responseBody = { message: 'Oh no!' }) => {
    const clientMethodStub = sinon.stub().rejects({ response: { body: responseBody } });
    fakeKubernetesApiClient[method] = clientMethodStub;
    return clientMethodStub;
  };
});

const loadApp = async () => {
  const wrapper = mountWithFakeAceEditor(App);
  await flushPromises();
  return wrapper;
};

const changeSelectValue = async (wrapper, selector, value) => {
  const namespaceSelector = wrapper.find(selector);
  namespaceSelector.element.value = value;
  namespaceSelector.trigger('change');
  await flushPromises();
  await wrapper.vm.$nextTick();
};

const changeInputValue = async (wrapper, selector, value) => {
  wrapper.find(selector).setValue(value);
  await wrapper.vm.$nextTick();
};

const clickButton = async (wrapper, selector) => {
  wrapper.find(selector).trigger('click');
  await flushPromises();
};
