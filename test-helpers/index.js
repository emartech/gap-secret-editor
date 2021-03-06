import Vue from 'vue';
import { KubeConfig } from '@kubernetes/client-node';
import log from 'electron-log';
import registerVueGlobals from '../src/renderer/vue-globals';

Vue.config.devtools = false;
Vue.config.productionTip = false;
Vue.config.ignoredElements = [/^e-/];
registerVueGlobals();

log.transports.file.level = false;
log.transports.console.level = false;

beforeEach(() => {
  sinon.stub(KubeConfig.prototype, 'getContexts');
  sinon.stub(KubeConfig.prototype, 'getCurrentContext');
  sinon.stub(KubeConfig.prototype, 'setCurrentContext');
  sinon.stub(KubeConfig.prototype, 'loadFromDefault');
  sinon.stub(KubeConfig.prototype, 'makeApiClient');
  window.e = {
    utils: {
      openNotification: () => {},
      openConsequentialConfirmationDialog: () => {}
    }
  };
});

afterEach(() => {
  sinon.restore();
});

const unitTestContext = require.context('../src', true, /\.spec$/);
unitTestContext.keys().forEach(unitTestContext);

const integrationTestContext = require.context('../integration-tests', true, /\.spec$/);
integrationTestContext.keys().forEach(integrationTestContext);
