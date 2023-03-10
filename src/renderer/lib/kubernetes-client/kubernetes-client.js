import {
  AppsV1Api,
  CoreV1Api,
  KubeConfig,
  V1Deployment,
  V1DeploymentSpec,
  V1ObjectMeta,
  V1PodTemplateSpec
} from '@kubernetes/client-node';
import { get, mapValues } from 'lodash';
import log from 'electron-log';
import KubernetesError from './kubernetes-error';

const logger = log.scope('kubernetes-client');
let kubeConfig;

export default {
  listContexts: async () => mapErrorToKubernetesError(() => {
    logger.debug('listing-contexts');
    return getKubeConfig().getContexts()
      .map(context => context.name);
  }),
  getContext: async () => mapErrorToKubernetesError(() => {
    logger.debug('getting-current-context');
    return getKubeConfig().getCurrentContext();
  }),
  setContext: async context => mapErrorToKubernetesError(() => {
    logger.debug('setting-context', { context });
    getKubeConfig().setCurrentContext(context);
  }),
  listNamespaces: async () => mapErrorToKubernetesError(async () => {
    logger.debug('listing-namespaces');
    const { body } = await getCoreApiClient().listNamespace();
    logger.debug('namespaces-listed');

    return body.items
      .filter(item => item.status.phase === 'Active')
      .map(item => item.metadata.name);
  }),

  listSecrets: async (namespace) => mapErrorToKubernetesError(async () => {
    logger.debug('listing-secrets', { namespace });
    const { body } = await getCoreApiClient().listNamespacedSecret(namespace);
    logger.debug('secrets-listed', { namespace });
    return body.items
      .filter(item =>
        !item.metadata.name.startsWith('default-token') &&
        !item.metadata.name.endsWith('web-tls') &&
        !item.metadata.name.endsWith('backup')
      )
      .map(item => item.metadata.name);
  }),

  loadSecret: async (namespace, name) => mapErrorToKubernetesError(async () => {
    logger.debug('loading-secret', { namespace, name });
    const { body } = await getCoreApiClient().readNamespacedSecret(name, namespace);
    logger.debug('secret-loaded', { namespace, name });
    return mapValues(body.data, value => Buffer.from(value, 'base64').toString());
  }),

  saveSecret: async (namespace, name, secret) => mapErrorToKubernetesError(async () => {
    logger.debug('saving-secret', { namespace, name });
    const secretConfig = {
      stringData: secret,
      metadata: { name }
    };

    await getCoreApiClient().replaceNamespacedSecret(name, namespace, secretConfig);
    logger.debug('secret-saved', { namespace, name });
  }),

  patchDeployments: async (namespace, name) => mapErrorToKubernetesError(async () => {
    logger.debug('pathing-deployment', { namespace, name });
    const labelSelector = `applicationName=${name}`;
    const deploymentListResponse = await getAppsApiClient().listNamespacedDeployment(
      namespace,
      undefined,
      undefined,
      undefined,
      undefined,
      labelSelector
    );
    logger.debug('deployments-listed', { namespace, name });
    const deploymentList = get(deploymentListResponse, 'body.items', []);

    for await (const deployment of deploymentList) {
      let deploymentName = get(deployment, 'metadata.name');
      if (!deploymentName) continue;

      const patch = generateDeploymentPatch();
      await getAppsApiClient().patchNamespacedDeployment(
        deploymentName,
        namespace,
        patch,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        { headers: { 'Content-Type': 'application/merge-patch+json' } }
      );
      logger.debug('deployment-patched', { namespace, name, deploymentName });
    }
  })
};

const getKubeConfig = () => {
  if (!kubeConfig) {
    kubeConfig = new KubeConfig();
    logger.debug('loading-default-config');
    kubeConfig.loadFromDefault();
  }
  return kubeConfig;
};

const generateDeploymentPatch = () => {
  const patch = new V1Deployment();
  patch.spec = new V1DeploymentSpec();
  patch.spec.template = new V1PodTemplateSpec();
  patch.spec.template.metadata = new V1ObjectMeta();
  patch.spec.template.metadata.annotations = {
    gapCLIRestartedAt: new Date().toISOString()
  };
  return patch;
};

const getCoreApiClient = () => {
  logger.debug('retrieving-core-api-client');
  const config = getKubeConfig();
  logger.debug('config-retrieved');
  const client = config.makeApiClient(CoreV1Api);
  logger.debug('client-created');
  return client;
};

const getAppsApiClient = () => {
  logger.debug('retrieving-apps-api-client');
  const config = getKubeConfig();
  logger.debug('config-retrieved');
  const client = config.makeApiClient(AppsV1Api);
  logger.debug('client-created');
  return client;
};

const mapErrorToKubernetesError = async func => {
  try {
    return await func();
  } catch (error) {
    if (error.response) {
      throw new KubernetesError(error.response);
    }
    throw error;
  }
};
