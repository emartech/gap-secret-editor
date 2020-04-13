import { CoreV1Api, KubeConfig } from '@kubernetes/client-node';
import { chain, mapValues, pick } from 'lodash-es';

export const listNamespacedSecrets = async () => {
  const { body } = await getApiClient().listSecretForAllNamespaces();

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

export const loadSecret = async (namespace, name) => {
  const { body } = await getApiClient().readNamespacedSecret(name, namespace);
  return mapValues(body.data, value => Buffer.from(value, 'base64').toString());
};

export const saveSecret = async (namespace, name, secret) => {
  const secretConfig = {
    stringData: secret,
    metadata: { name }
  };

  await getApiClient().replaceNamespacedSecret(name, namespace, secretConfig);
};

const getApiClient = () => {
  const kubeConfig = new KubeConfig();
  kubeConfig.loadFromDefault();
  return kubeConfig.makeApiClient(CoreV1Api);
};
