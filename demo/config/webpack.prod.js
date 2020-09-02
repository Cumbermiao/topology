const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const OptimizeCssPlugin = require('optimize-css-assets-webpack-plugin')
const TerserPlugin  = require('terser-webpack-plugin')

module.exports = {
  mode: 'production',
  optimization:{
    minimizer:[
      new TerserPlugin ({
        test: /\.js(\?.*)?$/i,
        terserOptions: {
          ecma: undefined,
          warnings: false,
          parse: {},
          compress: {
            drop_console: true,
            reduce_vars: true
          },
          mangle: true, // Note `mangle.properties` is `false` by default.
          module: false,
          output: null,
          toplevel: false,
          nameCache: null,
          ie8: false,
          keep_classnames: undefined,
          keep_fnames: false,
          safari10: false,
        }
      }),
    new OptimizeCssPlugin()],
    namedModules: true,
    namedChunks: true,
    concatenateModules: false,
    removeAvailableModules: true,
    removeEmptyChunks: true,
    mergeDuplicateChunks: true, //合并包相同 modules的 chunk
    flagIncludedChunks: true,//标记大模块的子集，在以加载大模块时无需加载子集
    occurrenceOrder: false, //告诉 webpack modules的顺序，以生成最小的 initial bundle
    providedExports: true,
    usedExports: true, // 删除未使用的 export 变量
    splitChunks: {
      chunks: "all",
      minSize: 1024*30,
      maxSize: 1024*400,
      minChunks: 1,
      maxAsyncRequests: 4,
      maxInitialRequests: 4,
      // name: true,
      cacheGroups: {
        'initial-common': {
          chunks: 'initial',
          minChunks: 2,
          maxInitialRequests: 4
        },
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          priority: 10,
          reuseExistingChunk: true
        },
        ele: {
          test: /[\\/]node_modules[\\/]_?element-ui(.*)/,
          enforce: true
        },
        echarts: {
          test: /[\\/]node_modules[\\/]_?echarts(.*)/,
          enforce: true
        }
      }
    }
  },

  plugins: [
    new CleanWebpackPlugin({
      verbose: true
    }),
    new BundleAnalyzerPlugin()
  ]
}