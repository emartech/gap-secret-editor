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
import KubernetesError from './kubernetes-error';

let kubeConfig;

export default {
  listContexts: async () => mapErrorToKubernetesError(() => {
    return getKubeConfig().getContexts()
      .map(context => context.name);
  }),
  getContext: async () => mapErrorToKubernetesError(() => {
    return getKubeConfig().getCurrentContext();
  }),
  setContext: async context => mapErrorToKubernetesError(() => {
    getKubeConfig().setCurrentContext(context);
  }),
  listNamespaces: async () => mapErrorToKubernetesError(async () => {
    const { body } = await getCoreApiClient().listNamespace();

    return body.items
      .filter(item => item.status.phase === 'Active')
      .map(item => item.metadata.name);
  }),

  listSecrets: async (namespace) => mapErrorToKubernetesError(async () => {
    const { body } = await getCoreApiClient().listNamespacedSecret(namespace);
    return body.items
      .filter(item =>
        !item.metadata.name.startsWith('default-token') &&
        !item.metadata.name.endsWith('web-tls') &&
        !item.metadata.name.endsWith('backup')
      )
      .map(item => item.metadata.name);
  }),

  loadSecret: async (namespace, name) => mapErrorToKubernetesError(async () => {
    const { body } = await getCoreApiClient().readNamespacedSecret(name, namespace);
    return mapValues(body.data, value => Buffer.from(value, 'base64').toString());
  }),

  saveSecret: async (namespace, name, secret) => mapErrorToKubernetesError(async () => {
    const secretConfig = {
      stringData: secret,
      metadata: { name }
    };

    await getCoreApiClient().replaceNamespacedSecret(name, namespace, secretConfig);
  }),

  patchDeployments: async (namespace, name) => mapErrorToKubernetesError(async () => {
    const labelSelector = `applicationName=${name}`;
    const deploymentListResponse = await getAppsApiClient().listNamespacedDeployment(
      namespace,
      undefined,
      undefined,
      undefined,
      undefined,
      labelSelector
    );
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
    }
  })
};

const getKubeConfig = () => {
  if (!kubeConfig) {
    kubeConfig = new KubeConfig();
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
  return getKubeConfig().makeApiClient(CoreV1Api);
};

const getAppsApiClient = () => {
  return getKubeConfig().makeApiClient(AppsV1Api);
};

const mapErrorToKubernetesError = async func => {
  try {
    return await func();
  } catch (e) {
    throw new KubernetesError(e);
  }
};
