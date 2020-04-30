import { KubeConfig } from '@kubernetes/client-node';
import {
  getCurrentContext,
  listNamespacedSecrets,
  loadSecret,
  patchDeployments,
  saveSecret
} from './kubernetes-client';

describe('KubernetesClient', () => {
  describe('#listNamespacedSecrets', () => {
    it('should return secret names grouped by namespaces', async () => {
      stubApiClient('listSecretForAllNamespaces', {
        items: [
          { metadata: { name: 'best-app', namespace: 'cool-team' } },
          { metadata: { name: 'wonderful-app', namespace: 'cool-team' } },
          { metadata: { name: 'terrible-app', namespace: 'lame-team' } },
          { metadata: { name: 'worst-app', namespace: 'lame-team' } }
        ]
      });

      const secrets = await listNamespacedSecrets();

      expect(secrets).to.eql({
        'cool-team': ['best-app', 'wonderful-app'],
        'lame-team': ['terrible-app', 'worst-app']
      });
    });

    it('should not return irrelevant secrets', async () => {
      stubApiClient('listSecretForAllNamespaces', {
        items: [
          { metadata: { name: 'best-app', namespace: 'cool-team' } },
          { metadata: { name: 'best-app-web-tls', namespace: 'cool-team' } },
          { metadata: { name: 'wonderful-app', namespace: 'cool-team' } },
          { metadata: { name: 'wonderful-app-web-tls', namespace: 'cool-team' } },
          { metadata: { name: 'default-token-a1b2c', namespace: 'cool-team' } }
        ]
      });

      const secrets = await listNamespacedSecrets();

      expect(secrets).to.eql({
        'cool-team': ['best-app', 'wonderful-app']
      });
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

      const secret = await loadSecret('cool-team', 'best-app');

      expect(secret).to.eql({
        NUMBER_42: '42',
        SUPER_SECRET_JSON: '{"super": "secret"}'
      });
    });
  });

  describe('#saveSecret', () => {
    it('should save secret', async () => {
      const saveMethodMock = stubApiClient('replaceNamespacedSecret');

      await saveSecret('cool-team', 'best-app', { JOHN: 'Lennon' });

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

      await patchDeployments('cool-team', 'best-app');

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

      await patchDeployments('cool-team', 'best-app');

      expect(patchMethodMock).to.not.have.been.called;
    });

  });

  describe('#getCurrentContext', () => {
    it('should return context from default config', () => {
      KubeConfig.prototype.loadFromDefault.callsFake(function() {
        this.currentContext = 'magnificent-context';
      });

      expect(getCurrentContext()).to.eql('magnificent-context');
    });

    it('should return context alias for staging', () => {
      KubeConfig.prototype.loadFromDefault.callsFake(function() {
        this.currentContext = '***REMOVED***';
      });

      expect(getCurrentContext()).to.eql('staging');
    });

    it('should return context alias for production', () => {
      KubeConfig.prototype.loadFromDefault.callsFake(function() {
        this.currentContext = '***REMOVED***';
      });

      expect(getCurrentContext()).to.eql('production');
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
