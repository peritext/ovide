/**
 * Webpack configuration for handling the application's source code
 * in development mode (standard)
 */
const webpack = require('webpack');
const path = require('path');
const sharedConfig = require('./webpack.web.shared');
const config = require('config');
const express = require('express');

module.exports = {
  node: sharedConfig.node,
  module: sharedConfig.module,
  entry: path.join(__dirname, 'app/src/main'),
  mode: 'development',
  output: {
      path: path.join(__dirname, 'app/build'),
      publicPath: 'build/',
      filename: 'bundle.js'
  },
  devServer: {
    filename: 'bundle.js',
    contentBase: path.join(__dirname, 'app/'),
    historyApiFallback: true,
    port: 9000,
    index: path.join(__dirname, 'app/index.html'),
    before: (app) => {
      app.use('build', express.static(path.join(__dirname, 'app/build')));
    }
  },
  plugins: sharedConfig.plugins.concat([
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('development')
      },
      'OVIDE_CONFIG': JSON.stringify(config)
    })
  ]),

};