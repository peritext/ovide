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
        test: /\.worker\.js$/,
        use: { 
          loader: 'worker-loader',
          options: { inline: true }
        }
      },
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
          {
            loader: 'image-webpack-loader',
            query: {
              mozjpeg: {
                progressive: true,
              },
              gifsicle: {
                interlaced: false,
              },
              optipng: {
                optimizationLevel: 7,
              },
              pngquant: {
                quality: '65-90',
                speed: 4,
              },
            },
          },
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