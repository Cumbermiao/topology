const webpack = require('webpack')
const path = require('path')

module.exports = {
  mode: 'development',
  devServer: {
    host: '0.0.0.0',
    port: '3001',
    hot: true,
    compress: true,
    historyApiFallback: true,
    proxy: {
      '/dtc': {
        target: 'http://10.3.7.231:8910',
        changeOrigin: true,
        pathRewrite: {
          '^/dtc': '/dtc'
        }
      }
    },
    disableHostCheck: true
  },
  module: {
    rules: [{
      test: /\.(js|vue)$/,
      loader: 'eslint-loader',
      enforce: 'pre',
      include: [path.resolve('src'), path.resolve('test')],
      options: {
        formatter: require('eslint-friendly-formatter')
      }
    }]
  },
  plugins: [
    new webpack.DllReferencePlugin({
      context: path.resolve(__dirname),
      manifest: require('../.cache/dll/dll-manifest.json')
    })
  ],
  devtool: 'eval-source-map'
}
