import { CoreV1Api, KubeConfig } from '@kubernetes/client-node';
import { chain, pick } from 'lodash-es';

export const listNamespacedSecrets = async () => {
  const kubeConfig = new KubeConfig();
  kubeConfig.loadFromDefault();
  const apiClient = kubeConfig.makeApiClient(CoreV1Api);

  const { body } = await apiClient.listSecretForAllNamespaces();

  return chain(body.items)
    .map(item => pick(item.metadata, ['name', 'namespace']))
    .groupBy('namespace')
    .mapValues(secrets =>
      secrets
        .map(secret => secret.name)
        .filter(secretName => !secretName.startsWith('default-token') && !secretName.endsWith('web-tls'))
    )
    .value();
};

