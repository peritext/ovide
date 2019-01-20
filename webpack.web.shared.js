/**
 * Webpack configuration base for handling the application's source code
 */
const webpack = require('webpack');
const path = require('path');

module.exports = {
  node:{
    child_process: 'empty',
    fs: 'empty',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules\/(?!dot-prop)\/*/,
        loader: 'babel-loader',
        options: {
          babelrc: true,
          extends: path.join(process.cwd(), './.babelrc'),
          cacheDirectory: true
        }
      },
      // {
      //   test: /\.(woff|ttf|otf|eot|woff2)$/i,
      //    use: [
      //     {
      //       loader: 'file-loader',
      //       options: {
      //         query: {
      //           name:'assets/[name].[ext]'
      //         }
      //       }
      //     },
      //   ]
      // },
      {
        test: /\.(jpe?g|png|gif|svg)$/i,
        use: [
          'url-loader?limit=10000',
          'image-webpack-loader'
        ]
      },
      {
        test: /\.(scss|sass)$/,
        use: ['style-loader', 'css-loader', 'sass-loader']
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      },
    ]
  },
  plugins: [
  ],
};