import Vue from 'vue';
import { KubeConfig } from '@kubernetes/client-node';

Vue.config.devtools = false;
Vue.config.productionTip = false;
Vue.config.ignoredElements = [/^e-/];

beforeEach(() => {
  sinon.stub(KubeConfig.prototype, 'loadFromDefault');
  sinon.stub(KubeConfig.prototype, 'makeApiClient');
  window.e = {
    utils: {
      openNotification: () => {}
    }
  };
});

afterEach(() => {
  sinon.restore();
});

// require all test-helpers files (files that ends with .spec.js)
const testsContext = require.context('./', true, /\.spec$/);
testsContext.keys().forEach(testsContext);

// require all src files except main.js for coverage.
// you can also change this to match only the subset of files that
// you want coverage for.
const srcContext = require.context('../src/renderer', true, /^\.\/(?!main(\.js)?$)/);
srcContext.keys().forEach(srcContext);
