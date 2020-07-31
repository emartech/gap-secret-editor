import { KubeConfig } from '@kubernetes/client-node';
import kubernetesClient from './kubernetes-client';
import KubernetesError from './kubernetes-error';

describe('KubernetesClient', () => {
  describe('#listContexts', () => {
    it('should return available contexts', async () => {
      KubeConfig.prototype.getContexts.returns([
        { name: 'staging' },
        { name: 'production' }
      ]);

      const contexts = await kubernetesClient.listContexts();

      expect(contexts).to.eql(['staging', 'production']);
    });
  });
  describe('#getContext', () => {
    it('should return current context', async () => {
      KubeConfig.prototype.getCurrentContext.returns('amazing-context');

      const context = await kubernetesClient.getContext();

      expect(context).to.eql('amazing-context');
    });
  });
  describe('#setContext', () => {
    it('should set current context', async () => {
      await kubernetesClient.setContext('magnificent-context');
      expect(KubeConfig.prototype.setCurrentContext).to.have.been.calledWith('magnificent-context');
    });
  });
  describe('#listNamespaces', () => {
    it('should list active namespaces', async () => {
      stubApiClient('listNamespace', {
        items: [
          { metadata: { name: 'cool-team' }, status: { phase: 'Active' } },
          { metadata: { name: 'bad-team' }, status: { phase: 'Active' } },
          { metadata: { name: 'dead-team' }, status: { phase: 'Terminating' } }
        ]
      });

      const secrets = await kubernetesClient.listNamespaces();

      expect(secrets).to.eql(['cool-team', 'bad-team']);
    });

    it('should throw Kubernetes error when request fails', async () => {
      stubFailingApiClient('listNamespace', {
        message: 'The Four Horsemen of the Apocalypse have arrived'
      });

      try {
        await kubernetesClient.listNamespaces();
        expect.fail('exception should have been thrown');
      } catch (e) {
        expect(e).to.be.an.instanceof(KubernetesError);
      }
    });
  });

  describe('#listSecrets', () => {
    it('should return secret names', async () => {
      const listMethodMock = stubApiClient('listNamespacedSecret', {
        items: [
          { metadata: { name: 'best-app' } },
          { metadata: { name: 'wonderful-app' } },
          { metadata: { name: 'terrible-app' } },
          { metadata: { name: 'worst-app' } }
        ]
      });

      const secrets = await kubernetesClient.listSecrets('cool-team');

      expect(secrets).to.eql(['best-app', 'wonderful-app', 'terrible-app', 'worst-app']);
      expect(listMethodMock).to.have.been.calledWith('cool-team');
    });

    it('should not return irrelevant secrets', async () => {
      stubApiClient('listNamespacedSecret', {
        items: [
          { metadata: { name: 'best-app' } },
          { metadata: { name: 'best-app-web-tls' } },
          { metadata: { name: 'wonderful-app' } },
          { metadata: { name: 'wonderful-app-web-tls' } },
          { metadata: { name: 'default-token-a1b2c' } }
        ]
      });

      const secrets = await kubernetesClient.listSecrets('cool-team');

      expect(secrets).to.eql(['best-app', 'wonderful-app']);
    });

    it('should throw Kubernetes error when request fails', async () => {
      stubFailingApiClient('listNamespacedSecret', {
        message: 'The Four Horsemen of the Apocalypse have arrived'
      });

      try {
        await kubernetesClient.listSecrets('cool-team');
        expect.fail('exception should have been thrown');
      } catch (e) {
        expect(e).to.be.an.instanceof(KubernetesError);
      }
    });
  });

  describe('#loadSecret', () => {
    it('should load secret and base64 decode its values', async () => {
      stubApiClient('readNamespacedSecret', {
        data: {
          NUMBER_42: 'NDI=',
          SUPER_SECRET_JSON: 'eyJzdXBlciI6ICJzZWNyZXQifQ=='
        }
      });

      const secret = await kubernetesClient.loadSecret('cool-team', 'best-app');

      expect(secret).to.eql({
        NUMBER_42: '42',
        SUPER_SECRET_JSON: '{"super": "secret"}'
      });
    });
  });

  describe('#saveSecret', () => {
    it('should save secret', async () => {
      const saveMethodMock = stubApiClient('replaceNamespacedSecret');

      await kubernetesClient.saveSecret('cool-team', 'best-app', { JOHN: 'Lennon' });

      expect(saveMethodMock).to.have.been.calledWith(
        'best-app',
        'cool-team',
        { stringData: { JOHN: 'Lennon' }, metadata: { name: 'best-app' } }
      );
    });
  });

  describe('#patchDeployments', () => {
    it('should patch all deployments using given secret', async () => {
      const listMethodMock = sinon.stub().resolves({
        body: {
          items: [
            { metadata: { name: 'best-app-web' } },
            { metadata: { name: 'best-app-worker' } },
            { not_metadata: 'some-deployment-without-metadata' }
          ]
        }
      });
      const patchMethodMock = sinon.stub().resolves();
      KubeConfig.prototype.makeApiClient.returns({
        listNamespacedDeployment: listMethodMock,
        patchNamespacedDeployment: patchMethodMock
      });

      await kubernetesClient.patchDeployments('cool-team', 'best-app');

      expect(listMethodMock).to.have.been.calledWith(
        'cool-team',
        undefined,
        undefined,
        undefined,
        undefined,
        'applicationName=best-app'
      );
      expect(patchMethodMock).to.have.been.calledTwice;
      expect(patchMethodMock).to.have.been.calledWith('best-app-web', 'cool-team', sinon.match.any);
      expect(patchMethodMock).to.have.been.calledWith('best-app-worker', 'cool-team', sinon.match.any);
    });

    it('should not patch anything when no deployment found', async () => {
      const patchMethodMock = sinon.stub().resolves();
      KubeConfig.prototype.makeApiClient.returns({
        listNamespacedDeployment: sinon.stub().resolves(),
        patchNamespacedDeployment: patchMethodMock
      });

      await kubernetesClient.patchDeployments('cool-team', 'best-app');

      expect(patchMethodMock).to.not.have.been.called;
    });
  });
});

const stubApiClient = (method, responseBody = null) => {
  const clientMethodStub = sinon.stub().resolves({ body: responseBody });
  KubeConfig.prototype.makeApiClient.returns({
    [method]: clientMethodStub
  });

  return clientMethodStub;
};

export const stubFailingApiClient = (method, responseBody = null) => {
  const clientMethodStub = sinon.stub().rejects({ response: { body: responseBody } });
  KubeConfig.prototype.makeApiClient.returns({
    [method]: clientMethodStub
  });

  return clientMethodStub;
};
