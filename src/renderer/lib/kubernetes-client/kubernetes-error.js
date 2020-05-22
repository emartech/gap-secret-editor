
export default class KubernetesError extends Error {
  constructor(error) {
    super(error.response.body.message);
    this.name = 'KubernetesError';
    this.data = error.response.body;
  }
}
