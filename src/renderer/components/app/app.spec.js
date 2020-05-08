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
  });

  describe('when namespace and secret selected', () => {
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

    it('should save secret when save button clicked', async () => {
      stubSecretList(secretList);
      stubSelectedSecret({});
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
  });

  const stubSecretList = secrets => {
    stubApiClient('listSecretForAllNamespaces', { items: secrets.map(metadata => ({ metadata })) });
  };

  const stubSelectedSecret = secret => {
    stubApiClient('readNamespacedSecret', { data: secret });
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
