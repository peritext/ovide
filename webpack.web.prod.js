/**
 * Webpack configuration for handling the application's source code
 * in production mode (standard + minify)
 */
const webpack = require('webpack');
// const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const sharedConfig = require('./webpack.web.shared');
const homepage = require('./package.json').homepage;
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

const config = {
  mode: 'production',
  module: sharedConfig.module,
  node: sharedConfig.node,
  plugins: sharedConfig.plugins
    .concat(
      new BundleAnalyzerPlugin({
        openAnalyzer: true,
        generateStatsFile: true,
        analyzerMode: 'enabled'
      })
    ),
  // optimization: {
  //   minimizer: [
  //     new UglifyJsPlugin({
  //       uglifyOptions: {
  //         ie8: false
  //       },
  //       parallel: true
  //     })
  //   ]
  // },
  output: {
    path: '/build',
    publicPath: homepage + '/build/'
  }
};

module.exports = config;