
const path = require('path')
const webpack = require('webpack')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')

module.exports = {
  mode: 'development',
  entry: {
    vendor: ['vue', 'vuex', 'vue-router', 'axios', 'element-ui']
  },
  output: {
    filename: 'js/[name]_[hash:5].bundle.js',
    chunkFilename: 'js/[name]_[contenthash:5].chunk.js',
    path: path.join(__dirname, '.cache/dll'),
    publicPath: '',
    library: '[name]_dll'
  },
  plugins: [
    new CleanWebpackPlugin({
      verbose: true,
      cleanOnceBeforeBuildPatterns: ['**/*']
    }),
    new webpack.DllPlugin({
      path: path.resolve(__dirname, '.cache/dll/dll-manifest.json'),
      context: path.resolve(__dirname),
      name: '[name]_dll'
    })
  ]
}
