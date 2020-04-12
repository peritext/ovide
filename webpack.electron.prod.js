const ExtractTextPlugin = require('extract-text-webpack-plugin')
const webpack = require('webpack');
const config = require('config');

module.exports = {
    mode: 'production',
    target: 'electron-main',
    entry: './app/src/renderer_process.js',
    output: {
        path: __dirname + '/app/electronBuild',
        publicPath: 'electronBuild/',
        filename: 'bundle.js'
    },
    module: {
        rules: [
            {
              test: /\.worker\.js$/,
              use: { 
                loader: 'worker-loader' ,
                options: { inline: true }
              }
            },
            {
                test: /\.js?$/,
                loader: 'babel-loader',
                options: {
                    presets: ['@babel/preset-env']
                },
                exclude: [/node_modules/]
            },
            {
                test: /\.s?css$/,
                loader: ExtractTextPlugin.extract({
                    fallback: "style-loader",
                    use: ['css-loader', 'sass-loader'],
                  }),
            },
            {
                test: /\.(woff|ttf|otf|eot|woff2)$/i,
                 use: [
                  {
                    loader: 'file-loader',
                    options: {
                      query: {
                        name:'assets/[name].[ext]'
                      }
                    }
                  },
                ]
              },
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
        ]
    },
    plugins: [
        new ExtractTextPlugin({
            filename: 'bundle.css',
            disable: false,
            allChunks: true
        }),
         new webpack.DefinePlugin({
          'process.env': {
            NODE_ENV: JSON.stringify('production')
          },
          'OVIDE_CONFIG': JSON.stringify(config)
        }),
    ],
    resolve: {
      extensions: ['.js', '.json', '.jsx']
    }

}