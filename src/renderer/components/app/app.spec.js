import { shallowMount, mount } from '@vue/test-utils';
import flushPromises from 'flush-promises';
import { KubeConfig } from '@kubernetes/client-node';
import App from './app';

describe('App', () => {
  const fakeKubernetesApiClient = {};
  const secretList = [
    { name: 'best-app', namespace: 'cool-team' },
    { name: 'wonderful-app', namespace: 'cool-team' },
    { name: 'terrible-app', namespace: 'lame-team' },
    { name: 'worst-app', namespace: 'lame-team' }
  ];

  beforeEach(() => {
    KubeConfig.prototype.makeApiClient.returns(fakeKubernetesApiClient);
  });

  describe('when loaded', () => {
    it('should indicate loading', async () => {
      stubSecretList(secretList);
      const wrapper = shallowMount(App);
      expect(wrapper.find('#page-loading-indicator').exists()).to.be.true;
      await flushPromises();
      expect(wrapper.find('#page-loading-indicator').exists()).to.be.false;
    });

    it('should list available namespaces', async () => {
      stubSecretList(secretList);
      const wrapper = await loadApp();

      const items = wrapper.find('#namespace-selector').attributes('items');
      expect(JSON.parse(items)).to.eql([
        { type: 'option', content: 'cool-team', value: 'cool-team' },
        { type: 'option', content: 'lame-team', value: 'lame-team' }
      ]);
    });

    it('should disable load/save buttons', async () => {
      stubSecretList(secretList);
      const wrapper = await loadApp();

      expect(wrapper.find('#load-button').attributes('disabled')).to.eql('disabled');
      expect(wrapper.find('#save-button').attributes('disabled')).to.eql('disabled');
    });
  });

  describe('when namespace selected', () => {
    it('should list available secrets', async () => {
      stubSecretList(secretList);
      const wrapper = await loadApp();

      await changeSelectValue(wrapper, '#namespace-selector', 'cool-team');

      const items = wrapper.find('#secret-selector').attributes('items');
      expect(JSON.parse(items)).to.eql([
        { type: 'option', content: 'best-app', value: 'best-app' },
        { type: 'option', content: 'wonderful-app', value: 'wonderful-app' }
      ]);
    });

    it('should disable load/save buttons', async () => {
      stubSecretList(secretList);
      const wrapper = await loadApp();

      await changeSelectValue(wrapper, '#namespace-selector', 'cool-team');

      expect(wrapper.find('#load-button').attributes('disabled')).to.eql('disabled');
      expect(wrapper.find('#save-button').attributes('disabled')).to.eql('disabled');
    });
  });

  describe('when namespace and secret selected', () => {
    it('should enable load button', async () => {
      stubSecretList(secretList);
      const wrapper = await loadApp();

      await changeSelectValue(wrapper, '#namespace-selector', 'cool-team');
      await changeSelectValue(wrapper, '#secret-selector', 'best-app');

      expect(wrapper.find('#load-button').attributes('disabled')).to.be.undefined;
    });

    it('should disable save button when secret not loaded', async () => {
      stubSecretList(secretList);
      const wrapper = await loadApp();

      await changeSelectValue(wrapper, '#namespace-selector', 'cool-team');
      await changeSelectValue(wrapper, '#secret-selector', 'best-app');

      expect(wrapper.find('#save-button').attributes('disabled')).to.eql('disabled');
    });

    it('should load secret when load button clicked', async () => {
      stubSecretList(secretList);
      stubSelectedSecret({
        NUMBER_42: 'NDI=',
        SUPER_SECRET_JSON: 'eyJzdXBlciI6ICJzZWNyZXQifQ=='
      });
      const wrapper = await loadApp();

      await changeSelectValue(wrapper, '#namespace-selector', 'cool-team');
      await changeSelectValue(wrapper, '#secret-selector', 'best-app');
      await clickButton(wrapper, '#load-button');

      const renderedSecretKeys = wrapper.findAll('input').wrappers.map(wrapper => wrapper.element.value);
      expect(renderedSecretKeys).to.eql(['NUMBER_42', 'SUPER_SECRET_JSON', '']);
    });

    describe('when loaded secret has not changed since load', () => {
      it('should save secret when save button clicked', async () => {
        stubSecretList(secretList);
        stubChangedSelectedSecret({ FOOD: 'cGl6emE=' }, { FOOD: 'cGl6emE=' });
        const saveMethodMock = stubApiClient('replaceNamespacedSecret');
        stubDeploymentListForSelectedSecret();
        const patchMethodMock = stubPatchMethod();
        const wrapper = await loadApp();

        await changeSelectValue(wrapper, '#namespace-selector', 'cool-team');
        await changeSelectValue(wrapper, '#secret-selector', 'best-app');
        await clickButton(wrapper, '#load-button');
        wrapper.find('input').setValue('DRINK');
        wrapper.find('textarea').setValue('coke');
        await clickButton(wrapper, '#save-button');

        expect(saveMethodMock).to.have.been.calledWith(
          'best-app',
          'cool-team',
          { stringData: { DRINK: 'coke' }, metadata: { name: 'best-app' } }
        );
        expect(patchMethodMock).to.have.been.called;
      });

      it('should display success notification when save button clicked', async () => {
        stubSecretList(secretList);
        stubChangedSelectedSecret({ FOOD: 'cGl6emE=' }, { FOOD: 'cGl6emE=' });
        sinon.stub(window.e.utils, 'openNotification');
        const wrapper = await loadApp();

        await changeSelectValue(wrapper, '#namespace-selector', 'cool-team');
        await changeSelectValue(wrapper, '#secret-selector', 'best-app');
        await clickButton(wrapper, '#load-button');
        wrapper.find('input').setValue('DRINK');
        wrapper.find('textarea').setValue('coke');
        await clickButton(wrapper, '#save-button');

        expect(window.e.utils.openNotification).to.have.been.calledWith(sinon.match({ title: 'Secret saved' }));
      });
    });

    describe('when loaded secret has changed since load', () => {
      it('should not save secret when save button clicked', async () => {
        stubSecretList(secretList);
        stubChangedSelectedSecret({ FOOD: 'cGl6emE=' }, { FOOD: 'bcOha29zIG5va2VkbGk=' });
        const saveMethodMock = stubApiClient('replaceNamespacedSecret');
        stubDeploymentListForSelectedSecret();
        const patchMethodMock = stubPatchMethod();
        const wrapper = await loadApp();

        await changeSelectValue(wrapper, '#namespace-selector', 'cool-team');
        await changeSelectValue(wrapper, '#secret-selector', 'best-app');
        await clickButton(wrapper, '#load-button');
        await clickButton(wrapper, '#save-button');

        expect(saveMethodMock).to.not.have.been.called;
        expect(patchMethodMock).to.not.have.been.called;
      });

      it('should display error notification when save button clicked', async () => {
        stubSecretList(secretList);
        stubChangedSelectedSecret({ FOOD: 'cGl6emE=' }, { FOOD: 'bcOha29zIG5va2VkbGk=' });
        sinon.stub(window.e.utils, 'openNotification');
        const wrapper = await loadApp();

        await changeSelectValue(wrapper, '#namespace-selector', 'cool-team');
        await changeSelectValue(wrapper, '#secret-selector', 'best-app');
        await clickButton(wrapper, '#load-button');
        await clickButton(wrapper, '#save-button');

        expect(window.e.utils.openNotification).to.have.been.calledWith(sinon.match({ title: 'Save failed' }));
      });
    });
  });

  const stubSecretList = secrets => {
    stubApiClient('listSecretForAllNamespaces', { items: secrets.map(metadata => ({ metadata })) });
  };

  const stubSelectedSecret = secret => {
    stubApiClient('readNamespacedSecret', { data: secret });
  };

  const stubChangedSelectedSecret = (firstSecret, secondSecret) => {
    const clientMethodStub = sinon.stub();
    clientMethodStub.onFirstCall().resolves({ body: { data: firstSecret } });
    clientMethodStub.onSecondCall().resolves({ body: { data: secondSecret } });
    fakeKubernetesApiClient.readNamespacedSecret = clientMethodStub;
  };

  const stubDeploymentListForSelectedSecret = () => {
    stubApiClient('listNamespacedDeployment', { items: [{ metadata: { name: 'best-app-web' } }] });
  };

  const stubPatchMethod = () => {
    return stubApiClient('patchNamespacedDeployment');
  };

  const stubApiClient = (method, responseBody = null) => {
    const clientMethodStub = sinon.stub().resolves({ body: responseBody });
    fakeKubernetesApiClient[method] = clientMethodStub;
    return clientMethodStub;
  };
});

const loadApp = async () => {
  const wrapper = mount(App);
  await flushPromises();
  return wrapper;
};

const changeSelectValue = async (wrapper, selector, value) => {
  const namespaceSelector = wrapper.find(selector);
  namespaceSelector.element.value = value;
  namespaceSelector.trigger('change');
  await wrapper.vm.$nextTick();
};

const clickButton = async (wrapper, selector) => {
  wrapper.find(selector).trigger('click');
  await flushPromises();
};
