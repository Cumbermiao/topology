// eslint-disable-next-line
const webpack = require("webpack");
const merge = require('webpack-merge')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const SpeedMeasurePlugin = require('speed-measure-webpack-plugin')
const WebpackBuildNotifierPlugin = require('webpack-build-notifier')
const VueLoaderPlugin = require('vue-loader/lib/plugin')
const { resolve } = require('path')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
// clean logs in mini-css-extract-plugin
const CleanUpStatsPlugin = require('./config/_modules/clean-up-stats-plugin.js')
const smp = new SpeedMeasurePlugin()
const devConf = require('./config/webpack.dev.js')
const prodConf = require('./config/webpack.prod.js')
const env_variables = require('./config/env.js')

const mode = process.env.NODE_ENV
const confMap = {
  development: devConf,
  production: prodConf
}
const envMap = {
  development: env_variables.dev,
  production: env_variables.prod
}
const conf = confMap[mode]
const env = envMap[mode]

const defaultConf = {
  entry: resolve(__dirname, './src/main.js'),
  output: {
    filename: 'js/[name]_[hash:5].bundle.js',
    chunkFilename: 'js/[name]_[contenthash:5].chunk.js',
    path: resolve(__dirname, './build'),
    publicPath: ''
  },
  resolve: {
    extensions: ['.js', '.vue', '.json', '.ts', '.tsx'],
    alias: {
      vue$: 'vue/dist/vue.esm.js',
      '@': resolve(__dirname, './src'),
      '~': resolve(__dirname, '../build')
    }
  },
  module: {
    rules: [{
      test: /(ts|tsx)$/,
      loader: 'ts-loader',
      exclude: /node_modules/,
      options: {
        appendTsSuffixTo: [/\.vue$/]
      }
    },
    {
      test: /\.vue$/,
      loader: 'vue-loader'
    },
    {
      test: /(js|jsx)$/,
      use: 'babel-loader',
      include: [
        resolve(__dirname, './src')
      ]
      // exclude: /node_modules/
    },

    {
      test: /\.css$/,
      use: [
        {
          loader: MiniCssExtractPlugin.loader
        },
        'css-loader',
        'postcss-loader'
      ]
      // element scss 主题定制无法 exclude
      // include: resolve(__dirname, 'src'),
      // exclude: /\/node_modules/
    },
    {
      test: /\.s(c|a)ss$/,
      use: [
        {
          loader: MiniCssExtractPlugin.loader
        },
        'css-loader',
        'postcss-loader',
        'sass-loader'
        //  {
        //   loader: 'style-resources-loader',
        //   options: {
        //     patterns: [
        //       resolve(__dirname, './src/styles/common.scss')
        //     ]
        //   }
        // }
      ],
      include: resolve(__dirname, 'src')
    },
    {
      test: /\.(png|jpe?g|gif|svg)(\?.*)?$/i,
      loader: 'url-loader',
      options: {
        name:
            mode === 'production'
              ? '/assets/[name].[hash:5].[ext]'
              : '[name].[hash:5].[ext]',
        esModule: false,
        limit: 1024 * 40
      },
      include: resolve(__dirname, './src/assets')
    },
    {
      test: /\.svg$/,
      loader: 'svg-sprite-loader',
      options: {
        symbolId: 'icon-[name]'
      },
      include: [resolve('src/icons')]
    },
    {
      test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
      loader: 'url-loader',
      options: {
        limit: 1024 * 20,
        name: mode === 'production'
          ? '/assets/[name].[hash:5].[ext]'
          : '[name].[hash:5].[ext]',
        esModule: false
      }
    },
    {
      test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
      loader: 'url-loader',
      options: {
        limit: 1024 * 20,
        name: mode === 'production'
          ? '/assets/[name].[hash:5].[ext]'
          : '[name].[hash:5].[ext]',
        esModule: false
      }
    }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: resolve(__dirname, 'index.html'),
      loading: 'loading'
    }),
    new webpack.DefinePlugin({
      env: JSON.stringify(env)
    }),
    new webpack.HashedModuleIdsPlugin(),
    new MiniCssExtractPlugin({
      filename: mode === 'production' ? 'css/[name]_[contenthash:5].css' : '[name]_[contenthash:5].css',
      chunkFilename: mode === 'production' ? 'css/[id]_[contenthash:5].css' : '[id]_[contenthash:5].css',
      ignoreOrder: true
    }),
    new VueLoaderPlugin(),
    new WebpackBuildNotifierPlugin({
      title: 'build success',
      suppressSuccess: true
    }),
    new CleanUpStatsPlugin()

  ]
}

module.exports = smp.wrap(merge(defaultConf, conf))
