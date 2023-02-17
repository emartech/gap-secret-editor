
export default class KubernetesError extends Error {
  constructor(errorResponse) {
    super(errorResponse.body?.message || 'Unknown Kubernetes error');
    this.name = 'KubernetesError';
    this.data = errorResponse.body;
  }
}
