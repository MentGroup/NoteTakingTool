const { override, addBabelPlugin } = require('customize-cra');
const path = require('path');

module.exports = override(
  // Add your Babel plugins with the "loose" configuration
  addBabelPlugin(["@babel/plugin-transform-class-properties", { "loose": true }]),
  addBabelPlugin(["@babel/plugin-transform-private-methods", { "loose": true }]),
  addBabelPlugin(["@babel/plugin-transform-private-property-in-object", { "loose": true }]),

  // Add your module fallbacks for Node.js core modules
  (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      stream: require.resolve('stream-browserify'),
      buffer: require.resolve('buffer/'),
      crypto: require.resolve('crypto-browserify'),
      util: require.resolve('util/'),
      assert: require.resolve('assert/'),
      querystring: require.resolve('querystring-es3'),
      os: require.resolve('os-browserify/browser'),
      path: require.resolve('path-browserify')
    };

    return config;
  }
);
