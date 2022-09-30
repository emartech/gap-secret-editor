const { merge } = require('webpack-merge');
const webpack = require('webpack');

const baseConfig = require('../.electron-vue/webpack.renderer.config');

// Set BABEL_ENV to use proper preset config
process.env.BABEL_ENV = 'test';

let webpackConfig = merge(baseConfig, {
  optimization: {
    nodeEnv: false
  },
  devtool: 'inline-source-map',
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': '"testing"'
    })
  ]
});

// don't treat dependencies as externals
delete webpackConfig.entry;
delete webpackConfig.externals;
delete webpackConfig.output.libraryTarget;

module.exports = config => {
  config.set({
    browsers: ['visibleElectron'],
    client: {
      useIframe: false
    },
    customLaunchers: {
      'visibleElectron': {
        base: 'Electron',
        flags: ['--headless'],
        browserWindowOptions: {
          webPreferences: {
            nativeWindowOpen: false,
            contextIsolation: false,
            enableRemoteModule: true,
            nodeIntegration: true,
            nodeIntegrationInWorker: true,
            webviewTag: true
          }
        }
      }
    },
    frameworks: ['mocha', 'sinon-chai'],
    files: ['index.js'],
    preprocessors: {
      './index.js': ['webpack', 'sourcemap']
    },
    reporters: ['mocha'],
    mochaReporter: {
      showDiff: 'inline'
    },
    webpack: webpackConfig,
    webpackMiddleware: {
      noInfo: true
    }
  });
};
