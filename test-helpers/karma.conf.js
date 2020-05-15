const merge = require('webpack-merge');
const webpack = require('webpack');
const path = require('path');

const baseConfig = require('../.electron-vue/webpack.renderer.config');

// Set BABEL_ENV to use proper preset config
process.env.BABEL_ENV = 'test';

let webpackConfig = merge(baseConfig, {
  devtool: '#inline-source-map',
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

// apply vue option to apply isparta-loader on js
webpackConfig.module.rules
  .find(rule => rule.use.loader === 'vue-loader').use.options.loaders.js = 'babel-loader';

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
        require: path.join('test-helpers', 'test-setup-workaround.js')
      }
    },
    frameworks: ['mocha', 'sinon-chai'],
    files: ['index.js'],
    preprocessors: {
      './index.js': ['webpack', 'sourcemap']
    },
    reporters: ['dots'],
    webpack: webpackConfig,
    webpackMiddleware: {
      noInfo: true
    }
  });
};
